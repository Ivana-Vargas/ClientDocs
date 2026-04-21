import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { Readable } from "node:stream"

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

import {
  resolveDocumentStorageProvider,
  type DocumentStorageProvider,
} from "@server/features/documents/domain/document-constants"

type SavePdfParams = {
  clientPublicId: string
  categorySlug: string
  originalFileName: string
  buffer: Buffer
}

type StoredPdfReadResult = {
  body: ReadableStream
  contentLength: number
  totalSize: number
  contentRange?: string
  status: 200 | 206
}

type SaveStoredPdfResult = {
  storageProvider: DocumentStorageProvider
  storageKey: string
}

let s3ClientSingleton: S3Client | null = null

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function buildStorageRoot() {
  return path.join(process.cwd(), "uploads", "documents")
}

function ensureDirectoryExists(directoryPath: string) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

function resolveSafeAbsolutePath(storageKey: string) {
  const normalizedKey = storageKey.replace(/\\/g, "/").trim()

  if (!normalizedKey || normalizedKey.startsWith("/") || normalizedKey.includes("..")) {
    throw new Error("invalid storage key")
  }

  const storageRoot = buildStorageRoot()
  const absolutePath = path.join(storageRoot, ...normalizedKey.split("/"))
  const normalizedAbsolutePath = path.normalize(absolutePath)
  const normalizedStorageRoot = path.normalize(storageRoot + path.sep)

  if (!normalizedAbsolutePath.startsWith(normalizedStorageRoot)) {
    throw new Error("unsafe storage path")
  }

  return normalizedAbsolutePath
}

function buildStorageKey(params: { clientPublicId: string; categorySlug: string }) {
  const safeClient = sanitizePathSegment(params.clientPublicId)
  const safeCategory = sanitizePathSegment(params.categorySlug)
  const randomSuffix = crypto.randomBytes(6).toString("hex")
  const fileName = `${Date.now()}-${randomSuffix}.pdf`
  return path.posix.join(safeClient, safeCategory, fileName)
}

function resolveR2Config() {
  const endpoint = process.env.R2_ENDPOINT?.trim()
  const region = process.env.R2_REGION?.trim() || "auto"
  const bucket = process.env.R2_BUCKET?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("missing required R2 configuration")
  }

  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
  }
}

function getS3Client() {
  if (s3ClientSingleton) {
    return s3ClientSingleton
  }

  const config = resolveR2Config()

  s3ClientSingleton = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  })

  return s3ClientSingleton
}

function toWebReadableStream(body: unknown): ReadableStream {
  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream
  }

  if (body && typeof body === "object" && "transformToWebStream" in body) {
    return (body as { transformToWebStream: () => ReadableStream }).transformToWebStream()
  }

  throw new Error("unsupported stream body type")
}

export function savePdfToLocalStorage(params: SavePdfParams) {
  const relativeStorageKey = buildStorageKey({
    clientPublicId: params.clientPublicId,
    categorySlug: params.categorySlug,
  })
  const absolutePath = resolveSafeAbsolutePath(relativeStorageKey)

  ensureDirectoryExists(path.dirname(absolutePath))
  fs.writeFileSync(absolutePath, params.buffer)

  return relativeStorageKey
}

async function savePdfToS3Storage(params: SavePdfParams) {
  const storageKey = buildStorageKey({
    clientPublicId: params.clientPublicId,
    categorySlug: params.categorySlug,
  })
  const config = resolveR2Config()
  const client = getS3Client()

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Body: params.buffer,
      ContentType: "application/pdf",
    }),
  )

  return storageKey
}

export async function savePdfToConfiguredStorage(params: SavePdfParams): Promise<SaveStoredPdfResult> {
  const storageProvider = resolveDocumentStorageProvider()

  if (storageProvider === "S3") {
    const storageKey = await savePdfToS3Storage(params)
    return { storageProvider, storageKey }
  }

  const storageKey = savePdfToLocalStorage(params)
  return { storageProvider: "LOCAL", storageKey }
}

export function readLocalStoredPdf(storageKey: string) {
  const absolutePath = resolveSafeAbsolutePath(storageKey)

  return {
    absolutePath,
    createReadStream: () => fs.createReadStream(absolutePath),
    stat: () => fs.statSync(absolutePath),
  }
}

async function readS3StoredPdf(storageKey: string, rangeHeader: string | null): Promise<StoredPdfReadResult> {
  const config = resolveR2Config()
  const client = getS3Client()

  const object = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Range: rangeHeader ?? undefined,
    }),
  )

  if (!object.Body) {
    throw new Error("empty object body")
  }

  const contentLength = object.ContentLength ?? 0
  const contentRange = object.ContentRange
  const totalSize = contentRange
    ? Number(contentRange.split("/")[1] ?? contentLength)
    : Number(contentLength)

  return {
    body: toWebReadableStream(object.Body),
    contentLength,
    totalSize,
    contentRange,
    status: rangeHeader ? 206 : 200,
  }
}

export async function readStoredPdf(storageProvider: DocumentStorageProvider, storageKey: string, rangeHeader: string | null) {
  if (storageProvider === "S3") {
    return readS3StoredPdf(storageKey, rangeHeader)
  }

  const localFile = readLocalStoredPdf(storageKey)
  const stats = localFile.stat()

  if (!rangeHeader) {
    return {
      body: Readable.toWeb(localFile.createReadStream()) as ReadableStream,
      contentLength: stats.size,
      totalSize: stats.size,
      status: 200 as const,
    }
  }

  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader)
  if (!match) {
    throw new Error("invalid range header")
  }

  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Number(match[2]) : stats.size - 1

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start < 0 || end >= stats.size) {
    throw new Error("invalid range header")
  }

  const stream = fs.createReadStream(localFile.absolutePath, { start, end })

  return {
    body: Readable.toWeb(stream) as ReadableStream,
    contentLength: end - start + 1,
    totalSize: stats.size,
    contentRange: `bytes ${start}-${end}/${stats.size}`,
    status: 206 as const,
  }
}

export function deleteLocalStoredPdf(storageKey: string) {
  const absolutePath = resolveSafeAbsolutePath(storageKey)

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath)
  }
}

async function deleteS3StoredPdf(storageKey: string) {
  const config = resolveR2Config()
  const client = getS3Client()

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    }),
  )
}

export async function deleteStoredPdf(storageProvider: DocumentStorageProvider, storageKey: string) {
  if (storageProvider === "S3") {
    await deleteS3StoredPdf(storageKey)
    return
  }

  deleteLocalStoredPdf(storageKey)
}
