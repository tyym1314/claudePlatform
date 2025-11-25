import request from '@/utils/request'

// ============ Guild Management ============

// Get guild list
export function getGuildList(data: {
  pageNo: number
  pageSize: number
  guildId?: number
  guildName?: string
}) {
  return request({
    url: '/business/backend/guild/getGuildList',
    method: 'post',
    data
  })
}

// Get guild detail
export function getGuildDetail(params: { guildId: number }) {
  return request({
    url: '/business/backend/guild/getGuildDetail',
    method: 'get',
    params
  })
}

// ============ Automatic Salary Management ============

// Get automatic salary config
export function getAutoSalaryConfig() {
  return request({
    url: '/business/backend/guild/getAutoSalaryConfig',
    method: 'get'
  })
}

// Set automatic salary config
export function setAutoSalaryConfig(data: {
  enabled: boolean
  salaryDay?: number
  salaryRules?: any[]
}) {
  return request({
    url: '/business/backend/guild/setAutoSalaryConfig',
    method: 'post',
    data
  })
}

// Execute automatic salary calculation
export function executeAutoSalary(data: { month: string }) {
  return request({
    url: '/business/backend/guild/executeAutoSalary',
    method: 'post',
    data
  })
}

// ============ Salary Details Management ============

// Get salary record list
export function getSalaryRecordList(data: {
  pageNo: number
  pageSize: number
  guildId?: number
  month?: string
  userId?: number
}) {
  return request({
    url: '/business/backend/guild/getSalaryRecordList',
    method: 'post',
    data
  })
}

// Get salary record detail
export function getSalaryRecordDetail(params: { recordId: number }) {
  return request({
    url: '/business/backend/guild/getSalaryRecordDetail',
    method: 'get',
    params
  })
}

// Export salary records
export function exportSalaryRecords(data: {
  guildId?: number
  month?: string
}) {
  return request({
    url: '/business/backend/guild/exportSalaryRecords',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// Approve salary
export function approveSalary(data: {
  recordId: number
  status: number
  remark?: string
}) {
  return request({
    url: '/business/backend/guild/approveSalary',
    method: 'post',
    data
  })
}

// Batch approve salary
export function batchApproveSalary(data: {
  recordIds: number[]
  status: number
  remark?: string
}) {
  return request({
    url: '/business/backend/guild/batchApproveSalary',
    method: 'post',
    data
  })
}
