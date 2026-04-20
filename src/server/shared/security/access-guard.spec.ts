import { beforeEach, describe, expect, it } from "vitest"

import { loginWithEmailPassword } from "@server/features/auth/application/auth-service"
import { clearAuthSessionsForTests } from "@server/features/auth/application/auth-session-store"
import { resetAuthUsersForTests } from "@server/features/auth/application/auth-user-store"

import { requireAuthenticatedUser } from "./access-guard"

describe("requireAuthenticatedUser", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    resetAuthUsersForTests()
    clearAuthSessionsForTests()
  })

  it("returns authenticated user when access cookie is valid", async () => {
    const result = await loginWithEmailPassword("admin@test.local", "admin-password")

    const user = requireAuthenticatedUser(`clientdocs_access_token=${result?.accessToken}`)

    expect(user.email).toBe("admin@test.local")
  })

  it("throws when access cookie is invalid", () => {
    expect(() => requireAuthenticatedUser("clientdocs_access_token=invalid-token")).toThrow(
      "invalid or expired access token",
    )
  })
})
