export function getCookieValue(cookieHeader: string, cookieName: string) {
  const cookiePair = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`))

  if (!cookiePair) {
    return null
  }

  return decodeURIComponent(cookiePair.slice(cookieName.length + 1))
}
