import axios from 'axios'
import type { ApiSuccess } from '@/types/api'
import { toApiError } from './apiError'

interface AxiosHandlers {
  getToken: () => string | null
  onUnauthorized: () => void
}

let handlers: AxiosHandlers = { getToken: () => null, onUnauthorized: () => undefined }

export const configureAxios = (next: AxiosHandlers) => {
  handlers = next
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
})

axiosInstance.interceptors.request.use((config) => {
  const token = handlers.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.kind === 'unauthorized' && handlers.getToken()) handlers.onUnauthorized()
    return Promise.reject(apiError)
  },
)

export const responseData = <T>(response: { data: ApiSuccess<T> }): T => response.data.data
