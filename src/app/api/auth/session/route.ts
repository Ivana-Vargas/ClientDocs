import { errorResponse, successResponse } from "@server/shared/errors/api-response"
import { HTTP_STATUS } from "@server/shared/errors/http-status"
import { logHttpRequestResult } from "@server/shared/observability/http-console-logger"
import { requireAuthenticatedUser } from "@server/shared/security/access-guard"

export async function GET(request: Request) {
  const startedAt = Date.now()
  const path = new URL(request.url).pathname

  try {
    const user = requireAuthenticatedUser(request.headers.get("cookie") ?? "")

    const response = successResponse(
      {
        user,
      },
      HTTP_STATUS.ok,
    )

    logHttpRequestResult({
      method: request.method,
      path,
      status: response.status,
      durationMs: Date.now() - startedAt,
    })

    return response
  } catch (error) {
    const response = errorResponse(error)
    logHttpRequestResult({
      method: request.method,
      path,
      status: response.status,
      durationMs: Date.now() - startedAt,
    })
    return response
  }
}
