import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@app/features/auth/ui/login-form"
import { LanguageSwitcher } from "@app/shared/ui/language-switcher"
import { getUserFromAccessToken } from "@server/features/auth/application/auth-service"
import { getAccessTokenCookieName } from "@server/features/auth/presentation/auth-cookies"
import { getDictionary } from "@shared/localization/dictionary"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const dictionary = getDictionary(locale)
  const accessToken = cookieStore.get(getAccessTokenCookieName())?.value

  if (accessToken) {
    const user = getUserFromAccessToken(accessToken)

    if (user) {
      redirect("/dashboard")
    }
  }

  return (
    <main className="login-page">
      <div className="page-floating-controls">
        <LanguageSwitcher
          locale={locale}
          label={dictionary.common.language}
          englishLabel={dictionary.common.english}
          spanishLabel={dictionary.common.spanish}
          updatedMessage={dictionary.common.languageUpdated}
          errorMessage={dictionary.common.languageError}
        />
      </div>

      <section className="login-card">
        <h1>{dictionary.common.brand}</h1>
        <h2>{dictionary.login.title}</h2>
        <p>{dictionary.login.subtitle}</p>
        <LoginForm
          labels={{
            email: dictionary.login.emailLabel,
            password: dictionary.login.passwordLabel,
            showPassword: dictionary.login.showPassword,
            hidePassword: dictionary.login.hidePassword,
            submit: dictionary.login.submit,
            submitting: dictionary.login.submitting,
            validationTitle: dictionary.login.validationTitle,
            validationDescription: dictionary.login.validationDescription,
            missingEmail: dictionary.login.missingEmail,
            missingPassword: dictionary.login.missingPassword,
            missingEmailAndPassword: dictionary.login.missingEmailAndPassword,
            inlineInvalidCredentials: dictionary.login.inlineInvalidCredentials,
            successTitle: dictionary.login.successTitle,
            successDescription: dictionary.login.successDescription,
            serviceErrorTitle: dictionary.login.serviceErrorTitle,
            serviceUnavailable: dictionary.login.serviceUnavailable,
            unexpectedError: dictionary.login.unexpectedError,
            error401: dictionary.login.error401,
            error401Description: dictionary.login.error401Description,
            error400: dictionary.login.error400,
            error400Description: dictionary.login.error400Description,
            error500: dictionary.login.error500,
            error500Description: dictionary.login.error500Description,
            close: dictionary.common.close,
          }}
        />
      </section>
    </main>
  )
}
