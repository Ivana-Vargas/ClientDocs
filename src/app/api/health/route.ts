import { NextResponse } from "next/server"

import { logger } from "@server/shared/observability/logger"

export async function GET() {
  logger.info({ event: "health_check" }, "health check requested")

  return NextResponse.json({
    status: "ok",
    service: "clientdocs",
    timestamp: new Date().toISOString(),
  })
}
