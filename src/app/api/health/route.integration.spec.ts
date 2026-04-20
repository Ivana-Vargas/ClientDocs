import { describe, expect, it } from "vitest"

import { GET } from "./route"

describe("GET /api/health", () => {
  it("returns healthy response payload", async () => {
    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe("ok")
    expect(payload.service).toBe("clientdocs")
    expect(new Date(payload.timestamp).toString()).not.toBe("Invalid Date")
  })
})
