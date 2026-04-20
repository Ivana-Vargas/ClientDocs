import { describe, expect, it } from "vitest"

import { POST } from "./route"

describe("POST /api/preferences/locale", () => {
  it("sets locale cookie when payload is valid", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/preferences/locale", {
        method: "POST",
        body: JSON.stringify({ locale: "en" }),
        headers: { "content-type": "application/json" },
      }),
    )

    const payload = await response.json()
    const setCookieHeader = response.headers.get("set-cookie") ?? ""

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.data.locale).toBe("en")
    expect(setCookieHeader).toContain("clientdocs_locale=en")
  })

  it("returns bad request for unsupported locale", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/preferences/locale", {
        method: "POST",
        body: JSON.stringify({ locale: "fr" }),
        headers: { "content-type": "application/json" },
      }),
    )

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("invalid_locale")
  })
})
