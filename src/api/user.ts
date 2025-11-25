import request from '@/utils/request'

// User list query
export function getUserList(data: any) {
  return request({
    url: '/backend/user/list',
    method: 'post',
    data
  })
}

// Update user diamonds
export function updateDiamonds(data: {
  userId: string
  operator: string
  remark: string
  source: string
  customerAmount: number
}) {
  return request({
    url: '/backend/user/update-diamonds',
    method: 'post',
    data
  })
}

// Batch add gold
export function batchAddGold(formData: FormData) {
  return request({
    url: '/backend/pay/batch-gold-add-by-excel',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Batch add diamond
export function batchAddDiamond(formData: FormData) {
  return request({
    url: '/backend/pay/batch-diamond-add-by-excel',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Get balance detail (diamond)
export function getBalanceDetail(data: {
  pageNo: number
  pageSize: number
  queryUserId: string
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/backend/pay/balance-detail',
    method: 'post',
    data
  })
}

// Get gold detail
export function getGoldDetail(data: {
  userId: string
  index: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/backend/pay/gold-detail',
    method: 'post',
    data
  })
}

// Add gold
export function addGold(data: { userId: string; count: number }) {
  return request({
    url: '/backend/pay/gold-add',
    method: 'post',
    data
  })
}

// Export record
export function exportRecord(data: {
  exportType: string
  userId: string
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/backend/pay/export-record',
    method: 'post',
    data
  })
}

// Update user level
export function updateLevel(data: { userId: string; level: string }) {
  return request({
    url: '/backend/user/update-level',
    method: 'post',
    data
  })
}

// BD update
export function bdUpdate(data: { userId: string; opType: number }) {
  return request({
    url: '/backend/user/bd-update',
    method: 'post',
    data
  })
}

// Prohibit user
export function prohibitUser(data: { userId: string; prohibitTime: number }) {
  return request({
    url: '/backend/user/prohibitUser',
    method: 'post',
    data
  })
}

// Relieve user
export function relieveUser(data: { userId: string }) {
  return request({
    url: '/backend/user/relieveUser',
    method: 'post',
    data
  })
}

// Prohibit device
export function prohibitDevice(data: { deviceId: string; prohibitTime: number }) {
  return request({
    url: '/backend/user/prohibitDevice',
    method: 'post',
    data
  })
}

// Relieve device
export function relieveDevice(data: { deviceId: string }) {
  return request({
    url: '/backend/user/relieveDevice',
    method: 'post',
    data
  })
}

// Get client log list
export function getClientLogList(data: { pageNo: number; pageSize: number; userId?: string }) {
  return request({
    url: '/backend/user/client-log-list',
    method: 'post',
    data
  })
}
