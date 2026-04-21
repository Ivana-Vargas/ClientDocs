export const PDF_MIME_TYPE = "application/pdf"

export const DOCUMENT_STORAGE_PROVIDERS = ["LOCAL", "S3"] as const

export type DocumentStorageProvider = (typeof DOCUMENT_STORAGE_PROVIDERS)[number]

export function resolveDocumentStorageProvider(): DocumentStorageProvider {
  const rawProvider = process.env.DOCUMENT_STORAGE_PROVIDER?.trim().toUpperCase()

  if (!rawProvider) {
    return "LOCAL"
  }

  if (rawProvider === "S3") {
    return "S3"
  }

  return "LOCAL"
}

export function resolveMaxUploadFileSizeBytes() {
  const rawMaxSize = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB ?? "20")
  const safeMaxSize = Number.isFinite(rawMaxSize) && rawMaxSize > 0 ? rawMaxSize : 20
  return Math.floor(safeMaxSize * 1024 * 1024)
}
