import bcrypt from "bcryptjs"

import type { AuthRole, AuthUser } from "@server/features/auth/domain/auth-role"

type EnvCredentials = {
  email: string
  password: string
  role: AuthRole
  id: string
}

const DEFAULT_CREDENTIALS: EnvCredentials[] = [
  {
    id: "admin-user",
    email: "admin@clientdocs.local",
    password: "admin123456",
    role: "admin",
  },
  {
    id: "manager-user",
    email: "manager@clientdocs.local",
    password: "manager123456",
    role: "manager",
  },
]

function getEnvCredentials(): EnvCredentials[] {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const managerEmail = process.env.MANAGER_EMAIL
  const managerPassword = process.env.MANAGER_PASSWORD

  if (!adminEmail || !adminPassword || !managerEmail || !managerPassword) {
    return DEFAULT_CREDENTIALS
  }

  return [
    {
      id: "admin-user",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    },
    {
      id: "manager-user",
      email: managerEmail,
      password: managerPassword,
      role: "manager",
    },
  ]
}

export function getAuthUsers(): AuthUser[] {
  return getEnvCredentials().map((user) => ({
    id: user.id,
    email: user.email.toLowerCase(),
    role: user.role,
    passwordHash: bcrypt.hashSync(user.password, 10),
  }))
}

export function getJwtConfig() {
  return {
    issuer: process.env.JWT_ISSUER ?? "clientdocs",
    audience: process.env.JWT_AUDIENCE ?? "clientdocs-web",
    secret: process.env.JWT_SECRET ?? "replace-with-dev-secret",
    accessTtl: process.env.JWT_ACCESS_TOKEN_TTL ?? "8h",
    refreshTtl: process.env.JWT_REFRESH_TOKEN_TTL ?? "14d",
  }
}
