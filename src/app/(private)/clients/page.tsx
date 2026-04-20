import { cookies } from "next/headers"

import { getDictionary } from "@shared/localization/dictionary"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

export default async function ClientsPage() {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const dictionary = getDictionary(locale)

  return (
    <main className="private-page">
      <header className="private-page__header">
        <h1>{dictionary.placeholders.clientsTitle}</h1>
        <p>{dictionary.placeholders.clientsDescription}</p>
      </header>
    </main>
  )
}
