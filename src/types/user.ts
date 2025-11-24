// User related types

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  userId: number
  username: string
  realName: string
  roleIds: number[]
  roles?: Role[]
  status: number
  createTime?: number
}

export interface Role {
  roleId: number
  roleName: string
}

export interface MenuItem {
  menuId: number
  menuName: string
  menuPath: string
  menuType: number
  perms?: string
  icon?: string
  orderNum: number
  parentId: number
  children?: MenuItem[]
}
