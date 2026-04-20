import { beforeEach, describe, expect, it } from "vitest"

import { issueTokenPair, verifyAccessToken, verifyRefreshToken } from "./jwt-token-service"

describe("jwt token service", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "token-test-secret"
    process.env.JWT_ISSUER = "clientdocs"
    process.env.JWT_AUDIENCE = "clientdocs-web"
    process.env.JWT_ACCESS_TOKEN_TTL = "8h"
    process.env.JWT_REFRESH_TOKEN_TTL = "14d"
  })

  it("issues and verifies access and refresh tokens", () => {
    const tokenPair = issueTokenPair({
      id: "admin-user",
      email: "admin@test.local",
      role: "admin",
      passwordHash: "hash",
    })

    const accessPayload = verifyAccessToken(tokenPair.accessToken)
    const refreshPayload = verifyRefreshToken(tokenPair.refreshToken)

    expect(accessPayload.sub).toBe("admin-user")
    expect(accessPayload.type).toBe("access")
    expect(refreshPayload.sub).toBe("admin-user")
    expect(refreshPayload.type).toBe("refresh")
  })
})
