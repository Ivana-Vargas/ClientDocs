import { describe, expect, it } from "vitest"

import { GET } from "./route"

describe("GET /api/health", () => {
  it("returns healthy response payload", async () => {
    const response = await GET(new Request("http://localhost:3000/api/health"))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.status).toBe(200)
    expect(payload.data.status).toBe("ok")
    expect(payload.data.service).toBe("clientdocs")
    expect(new Date(payload.data.timestamp).toString()).not.toBe("Invalid Date")
  })
})
