import type { ApiErrorDetail } from "@shared/types/api-response"

import type { HttpStatusCode } from "./http-status"

type AppErrorInput = {
  code: string
  status: HttpStatusCode
  message: string
  details?: ApiErrorDetail[]
}

export class AppError extends Error {
  readonly code: string
  readonly status: HttpStatusCode
  readonly details?: ApiErrorDetail[]

  constructor(input: AppErrorInput) {
    super(input.message)
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}
