import { PrismaClient } from "@prisma/client"

declare global {
  var __clientdocs_prisma__: PrismaClient | undefined
}

export const prismaClient =
  globalThis.__clientdocs_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__clientdocs_prisma__ = prismaClient
}
