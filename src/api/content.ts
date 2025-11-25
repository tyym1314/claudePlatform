import request from '@/utils/request'

// ============ Gift Wall Management ============

// Get gift wall list
export function getGiftWallList(data: {
  pageNo: number
  pageSize: number
}) {
  return request({
    url: '/business/backend/gift-wall/getGiftWallList',
    method: 'post',
    data
  })
}

// Add gift wall config
export function addGiftWall(data: {
  giftId: number
  position: number
  displayType: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/business/backend/gift-wall/addGiftWall',
    method: 'post',
    data
  })
}

// Update gift wall config
export function updateGiftWall(data: {
  id: number
  giftId: number
  position: number
  displayType: number
  startTime?: string
  endTime?: string
}) {
  return request({
    url: '/business/backend/gift-wall/updateGiftWall',
    method: 'post',
    data
  })
}

// Delete gift wall config
export function deleteGiftWall(data: { id: number }) {
  return request({
    url: '/business/backend/gift-wall/deleteGiftWall',
    method: 'post',
    data
  })
}

// Set gift wall status
export function setGiftWallStatus(data: {
  id: number
  status: number
}) {
  return request({
    url: '/business/backend/gift-wall/setGiftWallStatus',
    method: 'post',
    data
  })
}

// ============ Tag Management ============

// Get tag list
export function getTagList(data: {
  pageNo: number
  pageSize: number
  tagName?: string
  tagType?: number
}) {
  return request({
    url: '/business/backend/tag/getTagList',
    method: 'post',
    data
  })
}

// Add tag
export function addTag(data: {
  tagName: string
  tagType: number
  icon?: string
  color?: string
  sort?: number
}) {
  return request({
    url: '/business/backend/tag/addTag',
    method: 'post',
    data
  })
}

// Update tag
export function updateTag(data: {
  id: number
  tagName: string
  tagType: number
  icon?: string
  color?: string
  sort?: number
}) {
  return request({
    url: '/business/backend/tag/updateTag',
    method: 'post',
    data
  })
}

// Delete tag
export function deleteTag(data: { id: number }) {
  return request({
    url: '/business/backend/tag/deleteTag',
    method: 'post',
    data
  })
}

// Set tag status
export function setTagStatus(data: {
  id: number
  status: number
}) {
  return request({
    url: '/business/backend/tag/setTagStatus',
    method: 'post',
    data
  })
}

// ============ Topic Management ============

// Get topic list
export function getTopicList(data: {
  pageNo: number
  pageSize: number
  topicName?: string
  status?: number
}) {
  return request({
    url: '/business/backend/topic/getTopicList',
    method: 'post',
    data
  })
}

// Add topic
export function addTopic(data: {
  topicName: string
  description?: string
  coverImage?: string
  sort?: number
}) {
  return request({
    url: '/business/backend/topic/addTopic',
    method: 'post',
    data
  })
}

// Update topic
export function updateTopic(data: {
  id: number
  topicName: string
  description?: string
  coverImage?: string
  sort?: number
}) {
  return request({
    url: '/business/backend/topic/updateTopic',
    method: 'post',
    data
  })
}

// Delete topic
export function deleteTopic(data: { id: number }) {
  return request({
    url: '/business/backend/topic/deleteTopic',
    method: 'post',
    data
  })
}

// Set topic status
export function setTopicStatus(data: {
  id: number
  status: number
}) {
  return request({
    url: '/business/backend/topic/setTopicStatus',
    method: 'post',
    data
  })
}

// Get topic statistics
export function getTopicStatistics(params: { topicId: number }) {
  return request({
    url: '/business/backend/topic/getTopicStatistics',
    method: 'get',
    params
  })
}
