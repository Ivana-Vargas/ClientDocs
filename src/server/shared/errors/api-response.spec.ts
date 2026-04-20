import { describe, expect, it } from "vitest"

import { AppError } from "./app-error"
import { errorResponse, successResponse, validationDetailsFromZod } from "./api-response"
import { HTTP_STATUS } from "./http-status"

describe("api response helpers", () => {
  it("builds success response payload", async () => {
    const response = successResponse({ value: "ok" }, HTTP_STATUS.created)
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(payload.ok).toBe(true)
    expect(payload.data.value).toBe("ok")
  })

  it("builds app error response payload", async () => {
    const response = errorResponse(
      new AppError({
        code: "validation_failed",
        status: HTTP_STATUS.unprocessableEntity,
        message: "payload is invalid",
      }),
    )
    const payload = await response.json()

    expect(response.status).toBe(422)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("validation_failed")
  })

  it("builds fallback error response for unknown errors", async () => {
    const response = errorResponse(new Error("unknown"))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error.code).toBe("internal_server_error")
  })

  it("converts zod field errors into api detail entries", () => {
    const details = validationDetailsFromZod({ email: ["invalid"], password: ["required"] })

    expect(details).toEqual([
      { field: "email", message: "invalid" },
      { field: "password", message: "required" },
    ])
  })
})
