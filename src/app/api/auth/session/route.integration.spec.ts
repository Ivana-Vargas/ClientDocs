import { beforeEach, describe, expect, it } from "vitest"

import { resetAuthDatabaseForTests } from "@server/features/auth/infrastructure/auth-test-db-utils"

import { POST as loginPost } from "@app/api/auth/login/route"

import { GET } from "./route"

function extractCookieValue(setCookieHeader: string, cookieName: string) {
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;,\\s]+)`))
  return match?.[1] ?? ""
}

describe("GET /api/auth/session", () => {
  beforeEach(async () => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    await resetAuthDatabaseForTests()
  })

  it("returns current user for valid access token", async () => {
    const loginResponse = await loginPost(
      new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@test.local", password: "admin-password" }),
        headers: { "content-type": "application/json" },
      }),
    )

    const setCookieHeader = loginResponse.headers.get("set-cookie") ?? ""
    const accessToken =
      loginResponse.cookies.get("clientdocs_access_token")?.value ??
      extractCookieValue(setCookieHeader, "clientdocs_access_token")
    const cookieHeader = `clientdocs_access_token=${accessToken}`

    const response = await GET(
      new Request("http://localhost:3000/api/auth/session", {
        method: "GET",
        headers: { cookie: cookieHeader },
      }),
    )

    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.data.user.email).toBe("admin@test.local")
  })

  it("returns unauthorized when access token is missing", async () => {
    const response = await GET(new Request("http://localhost:3000/api/auth/session"))
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("missing_access_token")
  })
})
