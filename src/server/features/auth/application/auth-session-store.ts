type SessionRecord = {
  userId: string
  refreshJti: string
  expiresAt: Date
  revoked: boolean
}

const sessions = new Map<string, SessionRecord>()

export function saveRefreshSession(record: SessionRecord) {
  sessions.set(record.refreshJti, record)
}

export function getRefreshSession(refreshJti: string) {
  return sessions.get(refreshJti) ?? null
}

export function revokeRefreshSession(refreshJti: string) {
  const session = sessions.get(refreshJti)

  if (!session) {
    return
  }

  sessions.set(refreshJti, { ...session, revoked: true })
}

export function clearAuthSessionsForTests() {
  sessions.clear()
}
