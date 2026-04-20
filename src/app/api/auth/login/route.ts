import { NextResponse } from "next/server"
import { z } from "zod"

import { loginWithEmailPassword } from "@server/features/auth/application/auth-service"
import { setRefreshTokenCookie } from "@server/features/auth/presentation/auth-cookies"
import { logger } from "@server/shared/observability/logger"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parseResult = loginSchema.safeParse(json)

  if (!parseResult.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }

  const result = await loginWithEmailPassword(parseResult.data.email, parseResult.data.password)

  if (!result) {
    logger.warn({ event: "login_failed", email: parseResult.data.email }, "login failed")
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 })
  }

  const response = NextResponse.json(
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    { status: 200 },
  )

  setRefreshTokenCookie(response, result.refreshToken)
  logger.info({ event: "login_success", userId: result.user.id }, "login success")

  return response
}
