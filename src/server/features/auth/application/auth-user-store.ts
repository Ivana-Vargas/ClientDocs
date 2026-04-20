import type { AuthUser } from "@server/features/auth/domain/auth-role"

import { getAuthUsers } from "./auth-config"

let cachedUsers: AuthUser[] | null = null

function getUsers() {
  if (!cachedUsers) {
    cachedUsers = getAuthUsers()
  }

  return cachedUsers
}

export function findAuthUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return getUsers().find((user) => user.email === normalizedEmail) ?? null
}

export function findAuthUserById(userId: string) {
  return getUsers().find((user) => user.id === userId) ?? null
}

export function resetAuthUsersForTests() {
  cachedUsers = null
}
