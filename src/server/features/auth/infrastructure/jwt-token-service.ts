import crypto from "node:crypto"

import jwt, { type SignOptions } from "jsonwebtoken"

import type {
  AccessTokenPayload,
  AuthUser,
  RefreshTokenPayload,
} from "@server/features/auth/domain/auth-role"

import { getJwtConfig } from "@server/features/auth/application/auth-config"

type TokenPair = {
  accessToken: string
  refreshToken: string
  accessJti: string
  refreshJti: string
  refreshExpiresAt: Date
}

function parseTtlToSeconds(ttl: string) {
  const match = ttl.match(/^(\d+)([smhd])$/)

  if (!match) {
    return 60 * 60 * 24 * 14
  }

  const amount = Number(match[1])
  const unit = match[2]

  if (unit === "s") {
    return amount
  }

  if (unit === "m") {
    return amount * 60
  }

  if (unit === "h") {
    return amount * 60 * 60
  }

  return amount * 60 * 60 * 24
}

function randomJti() {
  return crypto.randomUUID()
}

function signToken(payload: object, expiresIn: SignOptions["expiresIn"]) {
  const config = getJwtConfig()

  return jwt.sign(payload, config.secret, {
    issuer: config.issuer,
    audience: config.audience,
    expiresIn,
  })
}

export function issueTokenPair(user: AuthUser): TokenPair {
  const config = getJwtConfig()
  const accessJti = randomJti()
  const refreshJti = randomJti()

  const accessToken = signToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: accessJti,
      type: "access",
    } satisfies AccessTokenPayload,
    config.accessTtl as SignOptions["expiresIn"],
  )

  const refreshToken = signToken(
    {
      sub: user.id,
      jti: refreshJti,
      type: "refresh",
    } satisfies RefreshTokenPayload,
    config.refreshTtl as SignOptions["expiresIn"],
  )

  const refreshExpiresAt = new Date(Date.now() + parseTtlToSeconds(config.refreshTtl) * 1000)

  return {
    accessToken,
    refreshToken,
    accessJti,
    refreshJti,
    refreshExpiresAt,
  }
}

export function verifyAccessToken(token: string) {
  const config = getJwtConfig()

  return jwt.verify(token, config.secret, {
    issuer: config.issuer,
    audience: config.audience,
  }) as AccessTokenPayload
}

export function verifyRefreshToken(token: string) {
  const config = getJwtConfig()

  return jwt.verify(token, config.secret, {
    issuer: config.issuer,
    audience: config.audience,
  }) as RefreshTokenPayload
}
