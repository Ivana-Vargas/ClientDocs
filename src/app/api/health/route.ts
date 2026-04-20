import { successResponse } from "@server/shared/errors/api-response"
import { HTTP_STATUS } from "@server/shared/errors/http-status"
import { logHttpRequestResult } from "@server/shared/observability/http-console-logger"
import { logger } from "@server/shared/observability/logger"

export async function GET(request: Request) {
  const startedAt = Date.now()
  const path = new URL(request.url).pathname

  logger.info({ event: "health_check" }, "health check requested")

  const response = successResponse(
    {
      status: "ok",
      service: "clientdocs",
      timestamp: new Date().toISOString(),
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
}
