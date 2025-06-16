import { ApiResponse } from './api-response'

export interface PaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export type PaginatedApiResponse<T = unknown> = ApiResponse<PaginatedData<T>>
