import { cookies } from "next/headers"

import { getUserFromAccessToken } from "@server/features/auth/application/auth-db-service"
import { getAccessTokenCookieName } from "@server/features/auth/presentation/auth-cookies"
import { getDictionary } from "@shared/localization/dictionary"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const dictionary = getDictionary(locale)
  const token = cookieStore.get(getAccessTokenCookieName())?.value ?? ""
  const user = getUserFromAccessToken(token)

  return (
    <main className="private-page">
      <header className="private-page__header">
        <h1>{dictionary.dashboard.title}</h1>
        <p>
          {dictionary.dashboard.welcome} {user?.email}
        </p>
      </header>

      <section className="private-card-grid">
        <article className="private-card">
          <h2>{dictionary.dashboard.clientsTitle}</h2>
          <p>{dictionary.dashboard.clientsDescription}</p>
        </article>
        <article className="private-card">
          <h2>{dictionary.dashboard.documentsTitle}</h2>
          <p>{dictionary.dashboard.documentsDescription}</p>
        </article>
        <article className="private-card">
          <h2>{dictionary.dashboard.paymentsTitle}</h2>
          <p>{dictionary.dashboard.paymentsDescription}</p>
        </article>
      </section>
    </main>
  )
}
