import bcrypt from "bcryptjs"

import {
  getRefreshSession,
  revokeRefreshSession,
  saveRefreshSession,
} from "@server/features/auth/application/auth-session-store"
import {
  findAuthUserByEmail,
  findAuthUserById,
} from "@server/features/auth/application/auth-user-store"
import {
  issueTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from "@server/features/auth/infrastructure/jwt-token-service"
import type { AuthRole } from "@server/features/auth/domain/auth-role"

export async function loginWithEmailPassword(email: string, password: string) {
  const user = findAuthUserByEmail(email)

  if (!user) {
    return null
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatches) {
    return null
  }

  const tokenPair = issueTokenPair(user)

  saveRefreshSession({
    userId: user.id,
    refreshJti: tokenPair.refreshJti,
    expiresAt: tokenPair.refreshExpiresAt,
    revoked: false,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ...tokenPair,
  }
}

export function refreshAccessToken(refreshToken: string) {
  let payload

  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    return null
  }

  if (payload.type !== "refresh") {
    return null
  }

  const session = getRefreshSession(payload.jti)

  if (!session || session.revoked || session.expiresAt.getTime() <= Date.now()) {
    return null
  }

  revokeRefreshSession(payload.jti)

  const user = findAuthUserById(session.userId)

  if (!user) {
    return null
  }

  const tokenPair = issueTokenPair(user)

  saveRefreshSession({
    userId: user.id,
    refreshJti: tokenPair.refreshJti,
    expiresAt: tokenPair.refreshExpiresAt,
    revoked: false,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ...tokenPair,
  }
}

export function logoutRefreshToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken)

    if (payload.type !== "refresh") {
      return
    }

    revokeRefreshSession(payload.jti)
  } catch {
    return
  }
}

export function getUserFromAccessToken(accessToken: string) {
  try {
    const payload = verifyAccessToken(accessToken)

    if (payload.type !== "access") {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as AuthRole,
    }
  } catch {
    return null
  }
}
