export function calculateOutstandingAmount(totalDebtAmount: number, totalPaidAmount: number) {
  if (totalDebtAmount < 0) {
    throw new Error("total debt amount cannot be negative")
  }

  if (totalPaidAmount < 0) {
    throw new Error("total paid amount cannot be negative")
  }

  if (totalPaidAmount > totalDebtAmount) {
    throw new Error("total paid amount cannot exceed total debt amount")
  }

  return totalDebtAmount - totalPaidAmount
}
