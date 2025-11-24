// Withdrawal types

export interface WithdrawalOrder {
  id: number
  platformOrderId: string
  channelOrderNo: string
  userId: string
  status: 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAIL'
  userInfo: string
  userStatus: string
  userDeviceInfo: string
  withdrawAccount: string
  withdrawDeviceInfo: string
  approvalInfo: string
  withdrawAmount: string
  fee: string
  receivedAmount: string
  withdrawCurrency: string
  localCurrencyAmount: string
  country: string
  region: string
  channel: string
  accountType: string
  userLevel: number
  accountBalance: string
  createTime: number
  finishTime: number
  remark: string
}

export interface WithdrawalListQuery {
  pageNo: number
  pageSize: number
  userId?: string
  orderStatus?: string
  channelOrderId?: string
  platformOrderId?: string
  accountType?: number
  channel?: string
  country?: string
  region?: string
  applyStartTime?: string
  applyEndTime?: string
  finishStartTime?: string
  finishEndTime?: string
}
