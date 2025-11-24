import request from '@/utils/request'
import type { LoginParams, UserInfo } from '@/types/user'

// Login
export function login(data: LoginParams) {
  return request({
    url: '/api/backend/sysUser/login',
    method: 'post',
    data
  })
}

// Get user info
export function getUserInfo(data: { userId: number }) {
  return request<UserInfo>({
    url: '/api/backend/sysUser/userInfo',
    method: 'post',
    data
  })
}

// Get user menu info
export function getMenuInfo(data: { userId: number }) {
  return request({
    url: '/api/backend/sysUser/getMenuInfo',
    method: 'post',
    data
  })
}

// Logout
export function logout() {
  return request({
    url: '/api/backend/sysUser/logout',
    method: 'post'
  })
}
