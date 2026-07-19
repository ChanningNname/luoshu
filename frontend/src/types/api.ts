// 统一 API 响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
  request_id: string
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}
