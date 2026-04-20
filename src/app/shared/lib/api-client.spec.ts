import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiClientError, apiRequest } from "./api-client"

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns successful payload data", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          status: 200,
          data: { value: "ok" },
        }),
        { status: 200 },
      ),
    )

    const result = await apiRequest<{ value: string }>("/api/test")

    expect(result.value).toBe("ok")
  })

  it("throws ApiClientError for error payloads", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          status: 401,
          error: {
            code: "unauthorized",
            message: "unauthorized request",
          },
        }),
        { status: 401 },
      ),
    )

    await expect(apiRequest("/api/test")).rejects.toBeInstanceOf(ApiClientError)
  })
})
