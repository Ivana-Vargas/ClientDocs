import { beforeEach, describe, expect, it } from "vitest"

import { clearAuthSessionsForTests } from "@server/features/auth/application/auth-session-store"
import { resetAuthUsersForTests } from "@server/features/auth/application/auth-user-store"

import { POST } from "./route"

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    resetAuthUsersForTests()
    clearAuthSessionsForTests()
  })

  it("returns access token and refresh cookie on success", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "admin-password",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.user.email).toBe("admin@test.local")
    expect(payload.accessToken).toBeTypeOf("string")
    expect(response.headers.get("set-cookie")).toContain("clientdocs_refresh_token=")
  })

  it("returns 401 for invalid credentials", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "invalid-password",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error).toBe("invalid_credentials")
  })
})
