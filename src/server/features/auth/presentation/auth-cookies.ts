import type { NextResponse } from "next/server"

const REFRESH_TOKEN_COOKIE = "clientdocs_refresh_token"

function getCookieConfig() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  }
}

export function setRefreshTokenCookie(response: NextResponse, refreshToken: string) {
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...getCookieConfig(),
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function clearRefreshTokenCookie(response: NextResponse) {
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...getCookieConfig(),
    maxAge: 0,
  })
}

export function getRefreshTokenCookieName() {
  return REFRESH_TOKEN_COOKIE
}
