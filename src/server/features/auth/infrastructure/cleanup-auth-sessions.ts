import { prismaClient } from "@database/db-client/prisma-client"

function getRetentionDays() {
  const rawValue = process.env.AUTH_SESSION_RETENTION_DAYS
  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 30
  }

  return parsedValue
}

function retentionCutoffDate() {
  const now = Date.now()
  const retentionMs = getRetentionDays() * 24 * 60 * 60 * 1000

  return new Date(now - retentionMs)
}

async function cleanupAuthSessions() {
  const cutoffDate = retentionCutoffDate()

  const expiredResult = await prismaClient.authSession.deleteMany({
    where: {
      expiresAt: {
        lt: cutoffDate,
      },
    },
  })

  const revokedResult = await prismaClient.authSession.deleteMany({
    where: {
      isRevoked: true,
      revokedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
  })

  console.log(
    `auth sessions cleanup completed: expired=${expiredResult.count}, revoked=${revokedResult.count}, retention_days=${getRetentionDays()}`,
  )
}

cleanupAuthSessions()
  .then(async () => {
    await prismaClient.$disconnect()
  })
  .catch(async (error) => {
    await prismaClient.$disconnect()
    console.error("auth sessions cleanup failed", error)
    process.exit(1)
  })
