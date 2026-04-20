import enDictionary from "@shared/localization/locales/en/common.json"
import esDictionary from "@shared/localization/locales/es/common.json"

import { type Locale } from "./config"

const dictionaries = {
  en: enDictionary,
  es: esDictionary,
} as const

export type Dictionary = (typeof dictionaries)["es"]

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}
