import bcrypt from "bcryptjs"

import { prismaClient } from "@database/db-client/prisma-client"

function requiredEnv(name: string) {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`missing required env: ${name}`)
  }

  return value
}

async function upsertAdminUser() {
  const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase()
  const adminPassword = requiredEnv("ADMIN_PASSWORD")
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

  await prismaClient.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  })
}

async function upsertManagerUserIfConfigured() {
  const managerEmail = process.env.MANAGER_EMAIL?.trim().toLowerCase()
  const managerPassword = process.env.MANAGER_PASSWORD?.trim()

  if (!managerEmail || !managerPassword) {
    return
  }

  const managerPasswordHash = await bcrypt.hash(managerPassword, 10)

  await prismaClient.user.upsert({
    where: { email: managerEmail },
    update: {
      passwordHash: managerPasswordHash,
      role: "MANAGER",
      isActive: true,
    },
    create: {
      email: managerEmail,
      passwordHash: managerPasswordHash,
      role: "MANAGER",
      isActive: true,
    },
  })
}

async function runSeed() {
  await upsertAdminUser()
  await upsertManagerUserIfConfigured()
}

runSeed()
  .then(async () => {
    await prismaClient.$disconnect()
    console.log("seed completed")
  })
  .catch(async (error) => {
    await prismaClient.$disconnect()
    console.error("seed failed", error)
    process.exit(1)
  })
