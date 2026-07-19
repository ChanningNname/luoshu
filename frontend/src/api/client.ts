import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api/v0',
  headers: { 'Content-Type': 'application/json' },
})

// 响应拦截器：提取 data 字段
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)
