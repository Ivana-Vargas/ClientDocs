import fs from "node:fs"
import path from "node:path"
import pino from "pino"

const logDir = process.env.LOG_DIR ?? "logs"
const logFilePath = path.join(process.cwd(), logDir, "app.log")

if (process.env.NODE_ENV !== "production") {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true })
}

const destination =
  process.env.NODE_ENV === "production" ? undefined : pino.destination(logFilePath)

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  destination,
)
