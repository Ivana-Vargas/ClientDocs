import { NextResponse } from "next/server"

import { refreshAccessToken } from "@server/features/auth/application/auth-service"
import {
  getRefreshTokenCookieName,
  setRefreshTokenCookie,
} from "@server/features/auth/presentation/auth-cookies"

export async function POST(request: Request) {
  const cookieStore = request.headers.get("cookie") ?? ""
  const refreshTokenPair = cookieStore
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${getRefreshTokenCookieName()}=`))

  if (!refreshTokenPair) {
    return NextResponse.json({ error: "missing_refresh_token" }, { status: 401 })
  }

  const refreshToken = decodeURIComponent(refreshTokenPair.split("=")[1] ?? "")

  if (!refreshToken) {
    return NextResponse.json({ error: "missing_refresh_token" }, { status: 401 })
  }

  const result = refreshAccessToken(refreshToken)

  if (!result) {
    return NextResponse.json({ error: "invalid_refresh_token" }, { status: 401 })
  }

  const response = NextResponse.json(
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    { status: 200 },
  )

  setRefreshTokenCookie(response, result.refreshToken)

  return response
}
