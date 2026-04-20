import { describe, expect, it } from "vitest"

import { DEFAULT_LOCALE, isSupportedLocale, resolveLocale } from "./config"

describe("localization config", () => {
  it("resolves default locale for undefined values", () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE)
  })

  it("resolves supported locale values", () => {
    expect(resolveLocale("en")).toBe("en")
    expect(resolveLocale("es")).toBe("es")
  })

  it("falls back for unsupported locale values", () => {
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE)
  })

  it("validates supported locale list", () => {
    expect(isSupportedLocale("en")).toBe(true)
    expect(isSupportedLocale("es")).toBe(true)
    expect(isSupportedLocale("de")).toBe(false)
  })
})
