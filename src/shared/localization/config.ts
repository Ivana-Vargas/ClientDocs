export const LOCALE_COOKIE_NAME = "clientdocs_locale"

export const SUPPORTED_LOCALES = ["es", "en"] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "es"

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export function resolveLocale(value: string | undefined): Locale {
  if (!value) {
    return DEFAULT_LOCALE
  }

  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}
