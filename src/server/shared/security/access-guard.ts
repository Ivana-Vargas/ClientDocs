import { getUserFromAccessToken } from "@server/features/auth/application/auth-service"
import { getAccessTokenCookieName } from "@server/features/auth/presentation/auth-cookies"
import { AppError } from "@server/shared/errors/app-error"
import { HTTP_STATUS } from "@server/shared/errors/http-status"

import { getCookieValue } from "./cookie-utils"

export function requireAuthenticatedUser(cookieHeader: string) {
  const accessToken = getCookieValue(cookieHeader, getAccessTokenCookieName())

  if (!accessToken) {
    throw new AppError({
      code: "missing_access_token",
      status: HTTP_STATUS.unauthorized,
      message: "missing access token",
    })
  }

  const user = getUserFromAccessToken(accessToken)

  if (!user) {
    throw new AppError({
      code: "invalid_access_token",
      status: HTTP_STATUS.unauthorized,
      message: "invalid or expired access token",
    })
  }

  return user
}
