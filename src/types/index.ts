export type ApiResponse<T> = {
  data: T
  message: string
  success: boolean
}

export type ApiError = {
  message: string
  code: string
  status: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type Nullable<T> = T | null

export type Maybe<T> = T | null | undefined
