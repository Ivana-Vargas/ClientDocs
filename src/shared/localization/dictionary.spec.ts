import { describe, expect, it } from "vitest"

import { getDictionary } from "./dictionary"

describe("localization dictionary", () => {
  it("returns spanish dictionary", () => {
    const dictionary = getDictionary("es")

    expect(dictionary.login.title).toBe("Inicio de sesión")
  })

  it("returns english dictionary", () => {
    const dictionary = getDictionary("en")

    expect(dictionary.login.title).toBe("Sign In")
  })
})
