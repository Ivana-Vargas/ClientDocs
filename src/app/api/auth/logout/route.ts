import { NextResponse } from "next/server"

import { logoutRefreshToken } from "@server/features/auth/application/auth-service"
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookieName,
} from "@server/features/auth/presentation/auth-cookies"

export async function POST(request: Request) {
  const cookieStore = request.headers.get("cookie") ?? ""
  const refreshTokenPair = cookieStore
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${getRefreshTokenCookieName()}=`))

  if (refreshTokenPair) {
    const refreshToken = decodeURIComponent(refreshTokenPair.split("=")[1] ?? "")
    if (refreshToken) {
      logoutRefreshToken(refreshToken)
    }
  }

  const response = NextResponse.json({ success: true }, { status: 200 })
  clearRefreshTokenCookie(response)

  return response
}
