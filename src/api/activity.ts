import request from '@/utils/request'

// ============ Banner Management ============

// Get banner list
export function getBannerList(data: { pageNo: number; pageSize: number; status?: number }) {
  return request({
    url: '/business/cms/backend/banner/getBannerList',
    method: 'post',
    data
  })
}

// Add banner
export function addBanner(data: any) {
  return request({
    url: '/business/cms/backend/banner/addBanner',
    method: 'post',
    data
  })
}

// Update banner
export function updateBanner(data: any) {
  return request({
    url: '/business/cms/backend/banner/updateBanner',
    method: 'post',
    data
  })
}

// Set banner status
export function setBannerStatus(data: { id: number; status: number }) {
  return request({
    url: '/business/cms/backend/banner/setBannerStatus',
    method: 'post',
    data
  })
}

// Delete banner
export function deleteBanner(data: { id: number }) {
  return request({
    url: '/business/cms/backend/banner/delBanner',
    method: 'post',
    data
  })
}

// ============ Lucky Gift Management ============

// Get lucky gift config list
export function getLuckyGiftList(data: { pageNo: number; pageSize: number }) {
  return request({
    url: '/business/cms/backend/luckyGift/getGiftConfigList',
    method: 'post',
    data
  })
}

// Add lucky gift config
export function addLuckyGift(data: { giftId: number; probability: number }) {
  return request({
    url: '/business/cms/backend/luckyGift/addGiftConfig',
    method: 'post',
    data
  })
}

// Delete lucky gift config
export function deleteLuckyGift(data: { id: number }) {
  return request({
    url: '/business/cms/backend/luckyGift/delGiftConfig',
    method: 'post',
    data
  })
}

// Get lucky gift pool config
export function getLuckyGiftPoolConfig() {
  return request({
    url: '/business/cms/backend/luckyGift/getLuckyGiftPoolConfig',
    method: 'get'
  })
}

// Set lucky gift pool config
export function setLuckyGiftPoolConfig(data: { coefficient: number }) {
  return request({
    url: '/business/cms/backend/luckyGift/setLuckyGiftPoolConfig',
    method: 'post',
    data
  })
}

// Query gift info
export function queryGift(params: { giftId: number }) {
  return request({
    url: '/business/cms/backend/luckyGift/queryGift',
    method: 'get',
    params
  })
}

// ============ Quick Gift Management ============

// Get quick gift info
export function getQuickGiftInfo() {
  return request({
    url: '/business/backend/room-convenient-gift/getShortCutGiftInfo',
    method: 'get'
  })
}

// Add quick gift
export function addQuickGift(data: { giftId: number; position: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/addShortCutGiftInfo',
    method: 'post',
    data
  })
}

// Update quick gift
export function updateQuickGift(data: { id: number; giftId: number; position: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/updateShortCutGiftInfo',
    method: 'post',
    data
  })
}

// Delete quick gift
export function deleteQuickGift(data: { id: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/deleteShortCutGiftInfo',
    method: 'post',
    data
  })
}

// Enable/Disable quick gift
export function enableQuickGift(data: { id: number; status: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/enableShortCutGiftInfo',
    method: 'post',
    data
  })
}

// ============ Low Price Gift Management ============

// Get low price gift info
export function getLowPriceGiftInfo() {
  return request({
    url: '/business/backend/room-convenient-gift/getLowPriceGiftInfo',
    method: 'get'
  })
}

// Add low price gift
export function addLowPriceGift(data: { giftId: number; position: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/addLowPriceGiftInfo',
    method: 'post',
    data
  })
}

// Update low price gift
export function updateLowPriceGift(data: { id: number; giftId: number; position: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/updateLowPriceGiftInfo',
    method: 'post',
    data
  })
}

// Delete low price gift
export function deleteLowPriceGift(data: { id: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/deleteLowPriceGiftInfo',
    method: 'post',
    data
  })
}

// Enable/Disable low price gift
export function enableLowPriceGift(data: { id: number; status: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/enableLowPriceGiftInfo',
    method: 'post',
    data
  })
}

// Get gift info by id
export function getGiftInfoById(params: { giftId: number }) {
  return request({
    url: '/business/backend/room-convenient-gift/getGiftInfoById',
    method: 'get',
    params
  })
}

// ============ Gift Package Management ============

// Get gift pack list
export function getGiftPackList(params: { pageNo: number; pageSize: number }) {
  return request({
    url: '/business/backend/gift-pack/getGiftPack',
    method: 'get',
    params
  })
}

// Add gift pack
export function addGiftPack(data: any) {
  return request({
    url: '/business/backend/gift-pack/addGiftPack',
    method: 'post',
    data
  })
}

// Update gift pack
export function updateGiftPack(data: any) {
  return request({
    url: '/business/backend/gift-pack/updateGiftPack',
    method: 'post',
    data
  })
}

// Delete gift pack
export function deleteGiftPack(data: { id: string }) {
  return request({
    url: '/business/backend/gift-pack/deleteGiftPack',
    method: 'post',
    data
  })
}

// Get gift item type list
export function getGiftItemTypeList() {
  return request({
    url: '/business/backend/gift-pack/getGiftItemTypeList',
    method: 'get'
  })
}

// Get gift item info
export function getGiftItemInfo(params: { itemType: string; itemId: number }) {
  return request({
    url: '/business/backend/gift-pack/getGiftItemInfo',
    method: 'get',
    params
  })
}

// Get gift pack base info list
export function getGiftPackBaseInfoList(data: any) {
  return request({
    url: '/business/backend/gift-pack/getGiftPackBaseInfoList',
    method: 'post',
    data
  })
}

// ============ Upload ============

// Upload static resource
export function uploadStaticResource(formData: FormData) {
  return request({
    url: '/backend/upload/static-resource',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
