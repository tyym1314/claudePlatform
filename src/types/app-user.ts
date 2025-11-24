// App user types (not system users)

export interface AppUser {
  id: number
  nickname: string
  avatar: string
  gender: number
  genderLabel: string
  birthday: number
  areaCode: string
  mobile: string
  email: string
  homeCountry: string
  homeCity: string
  lang: string
  status: number
  statusLabel: string
  registerIp: string
  type: number
  typeLabel: string
  balanceAmount: string
  createTime: number
  createTimeLabel: string
}

export interface UserListQuery {
  pageNo: number
  pageSize: number
  userId?: string
  mobile?: string
  gender?: number
  type?: number
  ltCreateTime?: string
  gtCreateTime?: string
}

export interface BalanceDetail {
  id: number
  newQuantity: string
  oldQuantity: string
  calcQuantity: string
  count: number
  balanceDescribe: string
  createTime: string
}

export interface GoldDetail {
  id: number
  text: string
  leftUrl: string
  rightUrl: string
  sourceNum: string
  createBy: number
  coinChangeNum: number
  balance: number
  createTime: number
}
