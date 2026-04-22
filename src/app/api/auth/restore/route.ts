import { NextResponse } from "next/server"

import { refreshAccessTokenFromDb } from "@server/features/auth/application/auth-db-service"
import {
  getRefreshTokenCookieName,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@server/features/auth/presentation/auth-cookies"
import { getCookieValue } from "@server/shared/security/cookie-utils"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nextPath = url.searchParams.get("next") || "/dashboard"
  const destination = nextPath.startsWith("/") ? nextPath : "/dashboard"
  const cookieHeader = request.headers.get("cookie") ?? ""
  const refreshToken = getCookieValue(cookieHeader, getRefreshTokenCookieName())

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const userAgent = request.headers.get("user-agent") ?? undefined
  const refreshed = await refreshAccessTokenFromDb(refreshToken, {
    ipAddress,
    userAgent,
  })

  if (!refreshed) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const response = NextResponse.redirect(new URL(destination, request.url))
  setAccessTokenCookie(response, refreshed.accessToken)
  setRefreshTokenCookie(response, refreshed.refreshToken)

  return response
}
