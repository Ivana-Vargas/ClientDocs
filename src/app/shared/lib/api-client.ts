import type { ApiResponse } from "@shared/types/api-response"

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: { field?: string; message: string }[]

  constructor(status: number, code: string, message: string, details?: { field?: string; message: string }[]) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!payload.ok) {
    throw new ApiClientError(
      payload.status,
      payload.error.code,
      payload.error.message,
      payload.error.details,
    )
  }

  return payload.data
}
