import request from '@/utils/request'

// ============ Dashboard Statistics ============

// Get overview statistics
export function getOverviewStatistics(params?: {
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/statistics/getOverviewStatistics',
    method: 'get',
    params
  })
}

// Get user statistics
export function getUserStatistics(params: {
  startTime: string
  endTime: string
  dimension?: string
}) {
  return request({
    url: '/api/business/backend/statistics/getUserStatistics',
    method: 'get',
    params
  })
}

// Get revenue statistics
export function getRevenueStatistics(params: {
  startTime: string
  endTime: string
  dimension?: string
}) {
  return request({
    url: '/api/business/backend/statistics/getRevenueStatistics',
    method: 'get',
    params
  })
}

// Get room statistics
export function getRoomStatisticsSummary(params: {
  startTime: string
  endTime: string
}) {
  return request({
    url: '/api/business/backend/statistics/getRoomStatistics',
    method: 'get',
    params
  })
}

// Get gift statistics
export function getGiftStatistics(params: {
  startTime: string
  endTime: string
  topN?: number
}) {
  return request({
    url: '/api/business/backend/statistics/getGiftStatistics',
    method: 'get',
    params
  })
}

// Get retention statistics
export function getRetentionStatistics(params: {
  startDate: string
  days?: number
}) {
  return request({
    url: '/api/business/backend/statistics/getRetentionStatistics',
    method: 'get',
    params
  })
}

// Get real-time statistics
export function getRealTimeStatistics() {
  return request({
    url: '/api/business/backend/statistics/getRealTimeStatistics',
    method: 'get'
  })
}

// ============ Report Management ============

// Get report list
export function getReportList(data: {
  pageNo: number
  pageSize: number
  reportType?: string
  status?: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/report/getReportList',
    method: 'post',
    data
  })
}

// Get report detail
export function getReportDetail(params: { reportId: number }) {
  return request({
    url: '/api/business/backend/report/getReportDetail',
    method: 'get',
    params
  })
}

// Handle report
export function handleReport(data: {
  reportId: number
  handleType: number
  remark?: string
}) {
  return request({
    url: '/api/business/backend/report/handleReport',
    method: 'post',
    data
  })
}

// Batch handle reports
export function batchHandleReports(data: {
  reportIds: number[]
  handleType: number
  remark?: string
}) {
  return request({
    url: '/api/business/backend/report/batchHandleReports',
    method: 'post',
    data
  })
}

// Export report data
export function exportReportData(data: {
  reportType?: string
  status?: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/report/exportReportData',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
