import { beforeEach, describe, expect, it } from "vitest"

import { clearAuthSessionsForTests } from "@server/features/auth/application/auth-session-store"
import { resetAuthUsersForTests } from "@server/features/auth/application/auth-user-store"

import { POST as loginPost } from "@app/api/auth/login/route"
import { POST as logoutPost } from "@app/api/auth/logout/route"

import { POST } from "./route"

function extractCookieValue(setCookieHeader: string, cookieName: string) {
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;,]+)`))
  return match?.[1] ?? ""
}

function buildCookieHeader(setCookieHeader: string) {
  const accessToken = extractCookieValue(setCookieHeader, "clientdocs_access_token")
  const refreshToken = extractCookieValue(setCookieHeader, "clientdocs_refresh_token")

  return `clientdocs_access_token=${accessToken}; clientdocs_refresh_token=${refreshToken}`
}

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    resetAuthUsersForTests()
    clearAuthSessionsForTests()
  })

  it("issues new tokens with a valid refresh cookie", async () => {
    const loginRequest = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "admin-password",
      }),
      headers: { "content-type": "application/json" },
    })

    const loginResponse = await loginPost(loginRequest)
    const setCookieHeader = loginResponse.headers.get("set-cookie")
    const cookieHeader = buildCookieHeader(setCookieHeader ?? "")

    expect(setCookieHeader).toBeTruthy()

    const refreshRequest = new Request("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: { cookie: cookieHeader },
    })

    const refreshResponse = await POST(refreshRequest)
    const payload = await refreshResponse.json()

    expect(refreshResponse.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.data.accessToken).toBeTypeOf("string")
    expect(payload.data.user.email).toBe("admin@test.local")
  })

  it("rejects refresh after logout revocation", async () => {
    const loginRequest = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "admin-password",
      }),
      headers: { "content-type": "application/json" },
    })

    const loginResponse = await loginPost(loginRequest)
    const setCookieHeader = loginResponse.headers.get("set-cookie")
    const cookieHeader = buildCookieHeader(setCookieHeader ?? "")

    expect(setCookieHeader).toBeTruthy()

    const logoutRequest = new Request("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: { cookie: cookieHeader },
    })

    await logoutPost(logoutRequest)

    const refreshRequest = new Request("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: { cookie: cookieHeader },
    })

    const refreshResponse = await POST(refreshRequest)
    const payload = await refreshResponse.json()

    expect(refreshResponse.status).toBe(401)
    expect(payload.error.code).toBe("invalid_refresh_token")
  })

  it("returns unauthorized when refresh cookie is missing", async () => {
    const refreshResponse = await POST(
      new Request("http://localhost:3000/api/auth/refresh", {
        method: "POST",
      }),
    )

    const payload = await refreshResponse.json()

    expect(refreshResponse.status).toBe(401)
    expect(payload.error.code).toBe("missing_refresh_token")
  })
})
