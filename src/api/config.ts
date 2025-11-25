import request from '@/utils/request'

// ============ Level Configuration ============

// Get level config list
export function getLevelConfigList() {
  return request({
    url: '/business/backend/config/getLevelConfigList',
    method: 'get'
  })
}

// Add level config
export function addLevelConfig(data: {
  level: number
  levelName: string
  minExp: number
  maxExp: number
  icon?: string
  privileges?: string[]
}) {
  return request({
    url: '/business/backend/config/addLevelConfig',
    method: 'post',
    data
  })
}

// Update level config
export function updateLevelConfig(data: {
  id: number
  level: number
  levelName: string
  minExp: number
  maxExp: number
  icon?: string
  privileges?: string[]
}) {
  return request({
    url: '/business/backend/config/updateLevelConfig',
    method: 'post',
    data
  })
}

// Delete level config
export function deleteLevelConfig(data: { id: number }) {
  return request({
    url: '/business/backend/config/deleteLevelConfig',
    method: 'post',
    data
  })
}
