export type ApiSuccessResponse<T> = {
  ok: true
  status: number
  data: T
}

export type ApiErrorDetail = {
  field?: string
  message: string
}

export type ApiErrorResponse = {
  ok: false
  status: number
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
