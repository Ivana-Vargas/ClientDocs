import { AppError } from "@server/shared/errors/app-error"
import { HTTP_STATUS } from "@server/shared/errors/http-status"

export function parseDecimalAmountToCents(value: number, field: string, invalidMessage: string) {
  const scaled = value * 100
  const rounded = Math.round(scaled)

  if (Math.abs(scaled - rounded) > 0.000001) {
    throw new AppError({
      code: "invalid_request",
      status: HTTP_STATUS.badRequest,
      message: invalidMessage,
      details: [
        {
          field,
          message: `${field} supports up to 2 decimals`,
        },
      ],
    })
  }

  return rounded
}
