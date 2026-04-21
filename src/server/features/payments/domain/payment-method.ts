export const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CARD", "OTHER"] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
