import request from '@/utils/request'

// Withdrawal list
export function getWithdrawalList(data: any) {
  return request({
    url: '/backend/pay/withdrawList',
    method: 'post',
    data
  })
}

// Get withdrawal summary
export function getWithdrawalSummary(data: { orderStatus: string; country?: string }) {
  return request({
    url: '/backend/pay/get-withdrawal-summary-info',
    method: 'post',
    data
  })
}

// Approval
export function approval(data: {
  ids: number[]
  operatorId: string
  operatorName: string
  status: string
  remark?: string
}) {
  return request({
    url: '/backend/pay/approval',
    method: 'post',
    data
  })
}

// Export withdrawal list
export function exportWithdrawalList(data: any) {
  return request({
    url: '/backend/pay/withdrawListUpload',
    method: 'post',
    data
  })
}

// User account list
export function getUserAccountList(data: { pageNo: number; pageSize: number; userId?: string }) {
  return request({
    url: '/backend/withdraw/user-account-list',
    method: 'post',
    data
  })
}
