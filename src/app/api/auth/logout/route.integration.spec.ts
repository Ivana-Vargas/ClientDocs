import { beforeEach, describe, expect, it } from "vitest"

import { clearAuthSessionsForTests } from "@server/features/auth/application/auth-session-store"
import { resetAuthUsersForTests } from "@server/features/auth/application/auth-user-store"

import { POST as loginPost } from "@app/api/auth/login/route"

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

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    resetAuthUsersForTests()
    clearAuthSessionsForTests()
  })

  it("clears session cookies and returns success response", async () => {
    const loginResponse = await loginPost(
      new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@test.local", password: "admin-password" }),
        headers: { "content-type": "application/json" },
      }),
    )

    const cookieHeader = buildCookieHeader(loginResponse.headers.get("set-cookie") ?? "")

    const response = await POST(
      new Request("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: { cookie: cookieHeader },
      }),
    )

    const payload = await response.json()
    const setCookie = response.headers.get("set-cookie") ?? ""

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.data.success).toBe(true)
    expect(setCookie).toContain("clientdocs_access_token=")
  })
})
