import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// API response structure
export interface ApiResponse<T = any> {
  ec: number
  data: T
  em: string
  traceId?: string
  ip?: string
  st?: number
}

// Create axios instance
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
service.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // Check if response is successful (ec === 0)
    if (res.ec === 0) {
      return res.data
    } else {
      // Handle business errors
      message.error(res.em || '请求失败')

      // Handle authentication errors
      if (res.ec === 401) {
        const userStore = useUserStore()
        userStore.clearState()
        router.push({ name: 'Login' })
      }

      return Promise.reject(new Error(res.em || '请求失败'))
    }
  },
  (error: AxiosError) => {
    console.error('Response error:', error)

    let errorMessage = '请求失败'

    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          errorMessage = '未授权,请重新登录'
          const userStore = useUserStore()
          userStore.clearState()
          router.push({ name: 'Login' })
          break
        case 403:
          errorMessage = '无权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        default:
          errorMessage = `请求失败: ${status}`
      }
    } else if (error.request) {
      errorMessage = '网络错误,请检查网络连接'
    }

    message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default service
