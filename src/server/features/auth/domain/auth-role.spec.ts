import { describe, expect, it } from "vitest"

import { AUTH_ROLES } from "./auth-role"

describe("auth roles", () => {
  it("contains supported roles", () => {
    expect(AUTH_ROLES).toEqual(["admin", "manager"])
  })
})
