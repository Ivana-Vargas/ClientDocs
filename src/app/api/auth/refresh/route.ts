import { refreshAccessToken } from "@server/features/auth/application/auth-service"
import {
  setAccessTokenCookie,
  getRefreshTokenCookieName,
  setRefreshTokenCookie,
} from "@server/features/auth/presentation/auth-cookies"
import { getCookieValue } from "@server/shared/security/cookie-utils"
import { AppError } from "@server/shared/errors/app-error"
import { errorResponse, successResponse } from "@server/shared/errors/api-response"
import { HTTP_STATUS } from "@server/shared/errors/http-status"
import { logHttpRequestResult } from "@server/shared/observability/http-console-logger"

export async function POST(request: Request) {
  const startedAt = Date.now()
  const path = new URL(request.url).pathname

  try {
    const cookieHeader = request.headers.get("cookie") ?? ""
    const refreshToken = getCookieValue(cookieHeader, getRefreshTokenCookieName())

    if (!refreshToken) {
      throw new AppError({
        code: "missing_refresh_token",
        status: HTTP_STATUS.unauthorized,
        message: "missing refresh token",
      })
    }

    const result = refreshAccessToken(refreshToken)

    if (!result) {
      throw new AppError({
        code: "invalid_refresh_token",
        status: HTTP_STATUS.unauthorized,
        message: "invalid or expired refresh token",
      })
    }

    const response = successResponse(
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      HTTP_STATUS.ok,
    )

    setAccessTokenCookie(response, result.accessToken)
    setRefreshTokenCookie(response, result.refreshToken)
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
