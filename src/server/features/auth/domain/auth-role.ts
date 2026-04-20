export const AUTH_ROLES = ["admin", "manager"] as const

export type AuthRole = (typeof AUTH_ROLES)[number]

export type AuthUser = {
  id: string
  email: string
  role: AuthRole
  passwordHash: string
}

export type AccessTokenPayload = {
  sub: string
  email: string
  role: AuthRole
  jti: string
  type: "access"
}

export type RefreshTokenPayload = {
  sub: string
  jti: string
  type: "refresh"
}
