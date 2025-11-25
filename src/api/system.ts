import request from '@/utils/request'

// ============ User Management ============

// User page query
export function getUserPage(data: { pageNo: number; pageSize: number; username?: string }) {
  return request({
    url: '/backend/sysUser/userPage',
    method: 'post',
    data
  })
}

// Add user
export function addUser(data: any) {
  return request({
    url: '/backend/sysUser/userAdd',
    method: 'post',
    data
  })
}

// Update user
export function updateUser(data: any) {
  return request({
    url: '/backend/sysUser/userUpdate',
    method: 'post',
    data
  })
}

// Delete user
export function deleteUser(data: { userId: number }) {
  return request({
    url: '/backend/sysUser/userDel',
    method: 'post',
    data
  })
}

// Get user info
export function getSysUserInfo(data: { userId: number }) {
  return request({
    url: '/backend/sysUser/userInfo',
    method: 'post',
    data
  })
}

// ============ Role Management ============

// Role page query
export function getRolePage(data: { pageNo: number; pageSize: number; roleName?: string }) {
  return request({
    url: '/backend/sysRole/rolePage',
    method: 'post',
    data
  })
}

// Get all roles
export function getAllRoles() {
  return request({
    url: '/backend/sysRole/roleAllList',
    method: 'get'
  })
}

// Add role
export function addRole(data: any) {
  return request({
    url: '/backend/sysRole/roleAdd',
    method: 'post',
    data
  })
}

// Update role
export function updateRole(data: any) {
  return request({
    url: '/backend/sysRole/roleUpdate',
    method: 'post',
    data
  })
}

// Get role info
export function getRoleInfo(data: { roleId: number }) {
  return request({
    url: '/backend/sysRole/roleInfo',
    method: 'post',
    data
  })
}

// ============ Menu Management ============

// Get menu list
export function getMenuList() {
  return request({
    url: '/backend/sysMenu/menuList',
    method: 'get'
  })
}

// Add menu
export function addMenu(data: any) {
  return request({
    url: '/backend/sysMenu/menuAdd',
    method: 'post',
    data
  })
}

// Update menu
export function updateMenu(data: any) {
  return request({
    url: '/backend/sysMenu/menuUpdate',
    method: 'post',
    data
  })
}

// Delete menu
export function deleteMenu(data: { menuId: number }) {
  return request({
    url: '/backend/sysMenu/menuDel',
    method: 'post',
    data
  })
}

// Get menu info
export function getMenuInfo(data: { menuId: number }) {
  return request({
    url: '/backend/sysMenu/menuInfo',
    method: 'post',
    data
  })
}
