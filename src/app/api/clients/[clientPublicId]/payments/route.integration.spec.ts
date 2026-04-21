import { beforeEach, describe, expect, it } from "vitest"

import { POST as loginPost } from "@app/api/auth/login/route"
import { POST as clientsPost } from "@app/api/clients/route"
import { resetAuthDatabaseForTests } from "@server/features/auth/infrastructure/auth-test-db-utils"

import { GET, POST } from "./route"

function extractCookieValue(setCookieHeader: string, cookieName: string) {
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;,\\s]+)`))
  return match?.[1] ?? ""
}

async function authCookieHeader() {
  const loginResponse = await loginPost(
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.local", password: "admin-password" }),
      headers: { "content-type": "application/json" },
    }),
  )

  const setCookieHeader = loginResponse.headers.get("set-cookie") ?? ""
  const accessToken =
    loginResponse.cookies.get("clientdocs_access_token")?.value ??
    extractCookieValue(setCookieHeader, "clientdocs_access_token")

  return `clientdocs_access_token=${accessToken}`
}

async function createClient(cookieHeader: string) {
  const response = await clientsPost(
    new Request("http://localhost:3000/api/clients", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        fullName: "Payment Client",
        totalDebt: 3000,
      }),
    }),
  )

  const payload = await response.json()
  return payload.data.client.publicId as string
}

describe("/api/clients/[clientPublicId]/payments", () => {
  beforeEach(async () => {
    process.env.ADMIN_EMAIL = "admin@test.local"
    process.env.ADMIN_PASSWORD = "admin-password"
    process.env.MANAGER_EMAIL = "manager@test.local"
    process.env.MANAGER_PASSWORD = "manager-password"
    process.env.JWT_SECRET = "test-secret"

    await resetAuthDatabaseForTests()
  })

  it("creates and lists payments for client", async () => {
    const cookieHeader = await authCookieHeader()
    const clientPublicId = await createClient(cookieHeader)

    const createResponse = await POST(
      new Request(`http://localhost:3000/api/clients/${clientPublicId}/payments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          amount: 1500.5,
          method: "CARD",
          referenceNote: "Payment test",
          paidAt: "2026-04-20",
        }),
      }),
      { params: Promise.resolve({ clientPublicId }) },
    )

    const createPayload = await createResponse.json()

    expect(createResponse.status).toBe(201)
    expect(createPayload.ok).toBe(true)
    expect(createPayload.data.payment.amountInCents).toBe(150050)

    const listResponse = await GET(
      new Request(`http://localhost:3000/api/clients/${clientPublicId}/payments`, {
        method: "GET",
        headers: { cookie: cookieHeader },
      }),
      { params: Promise.resolve({ clientPublicId }) },
    )

    const listPayload = await listResponse.json()

    expect(listResponse.status).toBe(200)
    expect(listPayload.ok).toBe(true)
    expect(listPayload.data.payments).toHaveLength(1)
    expect(listPayload.data.totalPaidInCents).toBe(150050)
  })

  it("returns 400 for invalid amount precision", async () => {
    const cookieHeader = await authCookieHeader()
    const clientPublicId = await createClient(cookieHeader)

    const response = await POST(
      new Request(`http://localhost:3000/api/clients/${clientPublicId}/payments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          amount: 25.555,
          method: "CASH",
        }),
      }),
      { params: Promise.resolve({ clientPublicId }) },
    )

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("invalid_request")
  })

  it("returns 404 when client does not exist", async () => {
    const cookieHeader = await authCookieHeader()

    const response = await GET(
      new Request("http://localhost:3000/api/clients/does-not-exist/payments", {
        method: "GET",
        headers: { cookie: cookieHeader },
      }),
      { params: Promise.resolve({ clientPublicId: "does-not-exist" }) },
    )

    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("client_not_found")
  })

  it("returns 400 when payment exceeds remaining debt", async () => {
    const cookieHeader = await authCookieHeader()
    const clientPublicId = await createClient(cookieHeader)

    const response = await POST(
      new Request(`http://localhost:3000/api/clients/${clientPublicId}/payments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          amount: 5000,
          method: "CASH",
        }),
      }),
      { params: Promise.resolve({ clientPublicId }) },
    )

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.ok).toBe(false)
    expect(payload.error.code).toBe("payment_exceeds_debt")
  })
})
