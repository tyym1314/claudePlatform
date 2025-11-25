import request from '@/utils/request'

// ============ Dynamic Management ============

// Get dynamic list
export function getDynamicList(data: {
  pageNo: number
  pageSize: number
  userId?: number
  content?: string
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/dynamic/getDynamicList',
    method: 'post',
    data
  })
}

// Get dynamic detail
export function getDynamicDetail(params: { dynamicId: number }) {
  return request({
    url: '/api/business/backend/dynamic/getDynamicDetail',
    method: 'get',
    params
  })
}

// Delete dynamic
export function deleteDynamic(data: { dynamicId: number }) {
  return request({
    url: '/api/business/backend/dynamic/deleteDynamic',
    method: 'post',
    data
  })
}

// ============ Pinned Dynamic Management ============

// Get pinned dynamic list
export function getPinnedDynamicList(data: {
  pageNo: number
  pageSize: number
}) {
  return request({
    url: '/api/business/backend/dynamic/getPinnedDynamicList',
    method: 'post',
    data
  })
}

// Pin dynamic
export function pinDynamic(data: {
  dynamicId: number
  position: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/dynamic/pinDynamic',
    method: 'post',
    data
  })
}

// Unpin dynamic
export function unpinDynamic(data: { id: number }) {
  return request({
    url: '/api/business/backend/dynamic/unpinDynamic',
    method: 'post',
    data
  })
}

// Update pinned dynamic
export function updatePinnedDynamic(data: {
  id: number
  position: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/dynamic/updatePinnedDynamic',
    method: 'post',
    data
  })
}

// ============ Explore Recommendation Position ============

// Get explore recommendation list
export function getExploreRecommendList(data: {
  pageNo: number
  pageSize: number
}) {
  return request({
    url: '/api/business/backend/explore/getRecommendList',
    method: 'post',
    data
  })
}

// Add explore recommendation
export function addExploreRecommend(data: {
  targetType: number
  targetId: number
  position: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/explore/addRecommend',
    method: 'post',
    data
  })
}

// Update explore recommendation
export function updateExploreRecommend(data: {
  id: number
  targetType: number
  targetId: number
  position: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/api/business/backend/explore/updateRecommend',
    method: 'post',
    data
  })
}

// Delete explore recommendation
export function deleteExploreRecommend(data: { id: number }) {
  return request({
    url: '/api/business/backend/explore/deleteRecommend',
    method: 'post',
    data
  })
}

// Enable/Disable explore recommendation
export function setExploreRecommendStatus(data: {
  id: number
  status: number
}) {
  return request({
    url: '/api/business/backend/explore/setRecommendStatus',
    method: 'post',
    data
  })
}

// Get target info by type and id
export function getTargetInfo(params: {
  targetType: number
  targetId: number
}) {
  return request({
    url: '/api/business/backend/explore/getTargetInfo',
    method: 'get',
    params
  })
}
