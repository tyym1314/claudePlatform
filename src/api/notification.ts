import request from '@/utils/request'

// ============ Push Notification Management ============

// Get notification list
export function getNotificationList(data: {
  pageNo: number
  pageSize: number
  title?: string
  status?: number
  pushType?: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/notification/getNotificationList',
    method: 'post',
    data
  })
}

// Get notification detail
export function getNotificationDetail(params: { notificationId: number }) {
  return request({
    url: '/api/business/backend/notification/getNotificationDetail',
    method: 'get',
    params
  })
}

// Add notification
export function addNotification(data: {
  title: string
  content: string
  pushType: number
  targetType: number
  targetIds?: string[]
  pushTime?: string
  jumpType?: number
  jumpUrl?: string
}) {
  return request({
    url: '/api/business/backend/notification/addNotification',
    method: 'post',
    data
  })
}

// Update notification
export function updateNotification(data: {
  id: number
  title: string
  content: string
  pushType: number
  targetType: number
  targetIds?: string[]
  pushTime?: string
  jumpType?: number
  jumpUrl?: string
}) {
  return request({
    url: '/api/business/backend/notification/updateNotification',
    method: 'post',
    data
  })
}

// Delete notification
export function deleteNotification(data: { id: number }) {
  return request({
    url: '/api/business/backend/notification/deleteNotification',
    method: 'post',
    data
  })
}

// Send notification immediately
export function sendNotification(data: { id: number }) {
  return request({
    url: '/api/business/backend/notification/sendNotification',
    method: 'post',
    data
  })
}

// Cancel scheduled notification
export function cancelNotification(data: { id: number }) {
  return request({
    url: '/api/business/backend/notification/cancelNotification',
    method: 'post',
    data
  })
}

// Get notification statistics
export function getNotificationStatistics(params: { notificationId: number }) {
  return request({
    url: '/api/business/backend/notification/getNotificationStatistics',
    method: 'get',
    params
  })
}
