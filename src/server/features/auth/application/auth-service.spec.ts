import { beforeEach, describe, expect, it } from "vitest"

import { clearAuthSessionsForTests } from "@server/features/auth/application/auth-session-store"
import {
  loginWithEmailPassword,
  logoutRefreshToken,
  refreshAccessToken,
} from "@server/features/auth/application/auth-service"
import { resetAuthUsersForTests } from "@server/features/auth/application/auth-user-store"

describe("auth service", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    resetAuthUsersForTests()
    clearAuthSessionsForTests()
  })

  it("logs in with valid credentials", async () => {
    const result = await loginWithEmailPassword("admin@test.local", "admin-password")

    expect(result).not.toBeNull()
    expect(result?.user.email).toBe("admin@test.local")
    expect(result?.user.role).toBe("admin")
    expect(result?.accessToken).toBeTypeOf("string")
    expect(result?.refreshToken).toBeTypeOf("string")
  })

  it("rejects invalid credentials", async () => {
    const result = await loginWithEmailPassword("admin@test.local", "wrong-password")

    expect(result).toBeNull()
  })

  it("refreshes tokens with a valid refresh token", async () => {
    const loginResult = await loginWithEmailPassword("manager@test.local", "manager-password")

    expect(loginResult).not.toBeNull()

    const refreshResult = refreshAccessToken(loginResult!.refreshToken)

    expect(refreshResult).not.toBeNull()
    expect(refreshResult?.user.email).toBe("manager@test.local")
    expect(refreshResult?.accessToken).toBeTypeOf("string")
  })

  it("rejects refresh token after logout", async () => {
    const loginResult = await loginWithEmailPassword("manager@test.local", "manager-password")

    expect(loginResult).not.toBeNull()
    logoutRefreshToken(loginResult!.refreshToken)

    const refreshResult = refreshAccessToken(loginResult!.refreshToken)

    expect(refreshResult).toBeNull()
  })
})
