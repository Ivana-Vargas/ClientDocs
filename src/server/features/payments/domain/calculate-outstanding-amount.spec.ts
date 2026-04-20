import { describe, expect, it } from "vitest"

import { calculateOutstandingAmount } from "./calculate-outstanding-amount"

describe("calculateOutstandingAmount", () => {
  it("returns missing balance for partial payments", () => {
    expect(calculateOutstandingAmount(1200, 300)).toBe(900)
  })

  it("returns zero when debt is fully paid", () => {
    expect(calculateOutstandingAmount(1200, 1200)).toBe(0)
  })

  it("throws when paid amount is higher than debt", () => {
    expect(() => calculateOutstandingAmount(1200, 1300)).toThrow(
      "total paid amount cannot exceed total debt amount",
    )
  })
})
