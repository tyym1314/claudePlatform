import request from '@/utils/request'

// ============ Room Management ============

// Get room list
export function getRoomList(data: {
  pageNo: number
  pageSize: number
  roomId?: number
  userId?: number
  roomName?: string
  status?: number
}) {
  return request({
    url: '/api/business/backend/room/getRoomList',
    method: 'post',
    data
  })
}

// Get room detail
export function getRoomDetail(params: { roomId: number }) {
  return request({
    url: '/api/business/backend/room/getRoomDetail',
    method: 'get',
    params
  })
}

// Close room
export function closeRoom(data: { roomId: number; reason?: string }) {
  return request({
    url: '/api/business/backend/room/closeRoom',
    method: 'post',
    data
  })
}

// Open room
export function openRoom(data: { roomId: number }) {
  return request({
    url: '/api/business/backend/room/openRoom',
    method: 'post',
    data
  })
}

// Update room info
export function updateRoomInfo(data: {
  roomId: number
  roomName?: string
  coverImage?: string
  description?: string
}) {
  return request({
    url: '/api/business/backend/room/updateRoomInfo',
    method: 'post',
    data
  })
}

// ============ Room Statistics ============

// Get room statistics
export function getRoomStatistics(data: {
  pageNo: number
  pageSize: number
  roomId?: number
  userId?: number
  startTime?: string
  endTime?: string
  sortBy?: string
  sortOrder?: string
}) {
  return request({
    url: '/api/business/backend/room/getRoomStatistics',
    method: 'post',
    data
  })
}

// Get room statistics detail
export function getRoomStatisticsDetail(params: {
  roomId: number
  date: string
}) {
  return request({
    url: '/api/business/backend/room/getRoomStatisticsDetail',
    method: 'get',
    params
  })
}

// Export room statistics
export function exportRoomStatistics(data: {
  roomId?: number
  userId?: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/room/exportRoomStatistics',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// Get room income ranking
export function getRoomIncomeRanking(data: {
  startTime: string
  endTime: string
  limit?: number
}) {
  return request({
    url: '/api/business/backend/room/getRoomIncomeRanking',
    method: 'post',
    data
  })
}

// Get room duration ranking
export function getRoomDurationRanking(data: {
  startTime: string
  endTime: string
  limit?: number
}) {
  return request({
    url: '/api/business/backend/room/getRoomDurationRanking',
    method: 'post',
    data
  })
}
