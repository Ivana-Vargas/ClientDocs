import { S3ServiceException } from "@aws-sdk/client-s3"

import { getCurrentClientDocumentFileAccessFromDb } from "@server/features/documents/application/documents-service"
import { readStoredPdf } from "@server/shared/storage/document-storage"
import { errorResponse } from "@server/shared/errors/api-response"
import { AppError } from "@server/shared/errors/app-error"
import { HTTP_STATUS } from "@server/shared/errors/http-status"
import { requireAuthenticatedUser } from "@server/shared/security/access-guard"

type RouteContext = {
  params: Promise<{
    clientPublicId: string
    documentPublicId: string
  }>
}

export const runtime = "nodejs"

function isInvalidRangeError(error: unknown) {
  if (error instanceof S3ServiceException && error.name === "InvalidRange") {
    return true
  }

  if (error instanceof Error && error.message === "invalid range header") {
    return true
  }

  return false
}

function isMissingStoredFileError(error: unknown) {
  if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
    return true
  }

  if (error instanceof Error && (error as { code?: string }).code === "ENOENT") {
    return true
  }

  return false
}

export async function GET(request: Request, context: RouteContext) {
  try {
    requireAuthenticatedUser(request.headers.get("cookie") ?? "")
    const { clientPublicId, documentPublicId } = await context.params

    const document = await getCurrentClientDocumentFileAccessFromDb(clientPublicId, documentPublicId)

    if (!document) {
      throw new AppError({
        code: "document_not_found",
        status: HTTP_STATUS.notFound,
        message: "document not found",
      })
    }

    const requestedRange = request.headers.get("range")

    try {
      const storedFile = await readStoredPdf(document.storageProvider, document.storageKey, requestedRange)

      return new Response(storedFile.body, {
        status: storedFile.status,
        headers: {
          "content-type": document.mimeType,
          "content-length": String(storedFile.contentLength),
          "accept-ranges": "bytes",
          "content-disposition": `inline; filename="${document.originalFileName}"`,
          "cache-control": "private, max-age=300",
          ...(storedFile.contentRange ? { "content-range": storedFile.contentRange } : {}),
        },
      })
    } catch (error) {
      if (isInvalidRangeError(error)) {
        const storedFile = await readStoredPdf(document.storageProvider, document.storageKey, null)

        return new Response(null, {
          status: 416,
          headers: {
            "content-range": `bytes */${storedFile.totalSize}`,
          },
        })
      }

      if (isMissingStoredFileError(error)) {
        throw new AppError({
          code: "document_not_found",
          status: HTTP_STATUS.notFound,
          message: "document file not found",
        })
      }

      throw error
    }
  } catch (error) {
    return errorResponse(error)
  }
}
