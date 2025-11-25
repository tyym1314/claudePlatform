<template>
  <div class="gift-page">
    <a-card title="礼物配置管理" :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- Quick Gift Tab -->
        <a-tab-pane key="quick" tab="快捷礼物">
          <div class="tab-content">
            <div class="action-bar">
              <a-button type="primary" @click="showAddModal('quick')">新增快捷礼物</a-button>
            </div>

            <a-table
              :columns="giftColumns"
              :data-source="quickGiftList"
              :loading="loading"
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-switch
                    :checked="record.status === 1"
                    @change="handleStatusChange('quick', record)"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="showEditModal('quick', record)">
                      编辑
                    </a-button>
                    <a-button type="link" danger size="small" @click="handleDelete('quick', record)">
                      删除
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- Low Price Gift Tab -->
        <a-tab-pane key="low" tab="低价礼物">
          <div class="tab-content">
            <div class="action-bar">
              <a-button type="primary" @click="showAddModal('low')">新增低价礼物</a-button>
            </div>

            <a-table
              :columns="giftColumns"
              :data-source="lowPriceGiftList"
              :loading="loading"
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-switch
                    :checked="record.status === 1"
                    @change="handleStatusChange('low', record)"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" size="small" @click="showEditModal('low', record)">
                      编辑
                    </a-button>
                    <a-button type="link" danger size="small" @click="handleDelete('low', record)">
                      删除
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- Lucky Gift Tab -->
        <a-tab-pane key="lucky" tab="幸运礼物">
          <div class="tab-content">
            <a-row :gutter="16" style="margin-bottom: 16px">
              <a-col :span="12">
                <a-card title="奖池系数配置" size="small">
                  <a-form layout="inline">
                    <a-form-item label="系数">
                      <a-input-number
                        v-model:value="poolCoefficient"
                        :min="0"
                        :step="0.1"
                        style="width: 150px"
                      />
                    </a-form-item>
                    <a-form-item>
                      <a-button type="primary" @click="handleUpdateCoefficient">更新</a-button>
                    </a-form-item>
                  </a-form>
                </a-card>
              </a-col>
            </a-row>

            <div class="action-bar">
              <a-button type="primary" @click="showAddModal('lucky')">新增幸运礼物</a-button>
            </div>

            <a-table
              :columns="luckyGiftColumns"
              :data-source="luckyGiftList"
              :loading="loading"
              :pagination="luckyPagination"
              @change="handleLuckyTableChange"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button type="link" danger size="small" @click="handleDelete('lucky', record)">
                    删除
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      :confirmLoading="modalLoading"
      width="600px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="礼物ID" required>
          <a-input-number
            v-model:value="formData.giftId"
            placeholder="请输入礼物ID"
            style="width: 100%"
            @blur="handleGiftIdBlur"
          />
        </a-form-item>
        <a-form-item v-if="giftInfo" label="礼物信息">
          <div>
            <div>名称: {{ giftInfo.giftName }}</div>
            <div>价格: {{ giftInfo.giftPrice }}</div>
          </div>
        </a-form-item>
        <a-form-item label="位置" required v-if="currentType !== 'lucky'">
          <a-input-number
            v-model:value="formData.position"
            :min="1"
            placeholder="请输入位置"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="概率" required v-if="currentType === 'lucky'">
          <a-input-number
            v-model:value="formData.probability"
            :min="0"
            :max="1"
            :step="0.01"
            placeholder="请输入概率(0-1)"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getQuickGiftInfo,
  addQuickGift,
  updateQuickGift,
  deleteQuickGift,
  enableQuickGift,
  getLowPriceGiftInfo,
  addLowPriceGift,
  updateLowPriceGift,
  deleteLowPriceGift,
  enableLowPriceGift,
  getLuckyGiftList,
  addLuckyGift,
  deleteLuckyGift,
  getLuckyGiftPoolConfig,
  setLuckyGiftPoolConfig,
  getGiftInfoById
} from '@/api/activity'

const loading = ref(false)
const activeTab = ref('quick')
const quickGiftList = ref<any[]>([])
const lowPriceGiftList = ref<any[]>([])
const luckyGiftList = ref<any[]>([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const currentType = ref<'quick' | 'low' | 'lucky'>('quick')
const poolCoefficient = ref(1.0)
const giftInfo = ref<any>(null)

const luckySearchForm = reactive({
  pageNo: 1,
  pageSize: 10
})

const luckyPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const formData = reactive({
  id: undefined as number | undefined,
  giftId: undefined as number | undefined,
  position: 1,
  probability: 0.1
})

const modalTitle = computed(() => {
  const typeMap: any = {
    quick: '快捷礼物',
    low: '低价礼物',
    lucky: '幸运礼物'
  }
  return `${isEdit.value ? '编辑' : '新增'}${typeMap[currentType.value]}`
})

const giftColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '礼物ID', dataIndex: 'giftId', key: 'giftId', width: 100 },
  { title: '礼物名称', dataIndex: 'giftName', key: 'giftName' },
  { title: '位置', dataIndex: 'position', key: 'position', width: 80 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150 }
]

const luckyGiftColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '礼物ID', dataIndex: 'giftId', key: 'giftId', width: 100 },
  { title: '礼物名称', dataIndex: 'giftName', key: 'giftName' },
  { title: '概率', dataIndex: 'probability', key: 'probability', width: 100 },
  { title: '操作', key: 'action', width: 100 }
]

onMounted(() => {
  fetchQuickGiftList()
  fetchLowPriceGiftList()
  fetchLuckyGiftList()
  fetchPoolConfig()
})

async function fetchQuickGiftList() {
  try {
    loading.value = true
    const res = await getQuickGiftInfo()
    quickGiftList.value = res.list || []
  } catch (error) {
    console.error('Fetch quick gift error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchLowPriceGiftList() {
  try {
    loading.value = true
    const res = await getLowPriceGiftInfo()
    lowPriceGiftList.value = res.list || []
  } catch (error) {
    console.error('Fetch low price gift error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchLuckyGiftList() {
  try {
    loading.value = true
    const res = await getLuckyGiftList(luckySearchForm)
    luckyGiftList.value = res.records || []
    luckyPagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch lucky gift error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchPoolConfig() {
  try {
    const res = await getLuckyGiftPoolConfig()
    poolCoefficient.value = res.coefficient || 1.0
  } catch (error) {
    console.error('Fetch pool config error:', error)
  }
}

async function handleUpdateCoefficient() {
  try {
    await setLuckyGiftPoolConfig({ coefficient: poolCoefficient.value })
    message.success('更新成功')
  } catch (error) {
    console.error('Update coefficient error:', error)
  }
}

function handleLuckyTableChange(pag: any) {
  luckySearchForm.pageNo = pag.current
  luckySearchForm.pageSize = pag.pageSize
  luckyPagination.current = pag.current
  luckyPagination.pageSize = pag.pageSize
  fetchLuckyGiftList()
}

function showAddModal(type: 'quick' | 'low' | 'lucky') {
  isEdit.value = false
  currentType.value = type
  formData.id = undefined
  formData.giftId = undefined
  formData.position = 1
  formData.probability = 0.1
  giftInfo.value = null
  modalVisible.value = true
}

function showEditModal(type: 'quick' | 'low', record: any) {
  isEdit.value = true
  currentType.value = type
  formData.id = record.id
  formData.giftId = record.giftId
  formData.position = record.position
  giftInfo.value = null
  modalVisible.value = true
}

async function handleGiftIdBlur() {
  if (!formData.giftId) return
  try {
    const res = await getGiftInfoById({ giftId: formData.giftId })
    giftInfo.value = res
  } catch (error) {
    console.error('Get gift info error:', error)
  }
}

async function handleStatusChange(type: 'quick' | 'low', record: any) {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    if (type === 'quick') {
      await enableQuickGift({ id: record.id, status: newStatus })
    } else {
      await enableLowPriceGift({ id: record.id, status: newStatus })
    }
    message.success('状态更新成功')
    if (type === 'quick') {
      fetchQuickGiftList()
    } else {
      fetchLowPriceGiftList()
    }
  } catch (error) {
    console.error('Status change error:', error)
  }
}

async function handleSubmit() {
  if (!formData.giftId) {
    message.error('请输入礼物ID')
    return
  }

  try {
    modalLoading.value = true
    if (currentType.value === 'quick') {
      if (isEdit.value) {
        await updateQuickGift(formData)
      } else {
        await addQuickGift({ giftId: formData.giftId, position: formData.position })
      }
      fetchQuickGiftList()
    } else if (currentType.value === 'low') {
      if (isEdit.value) {
        await updateLowPriceGift(formData)
      } else {
        await addLowPriceGift({ giftId: formData.giftId, position: formData.position })
      }
      fetchLowPriceGiftList()
    } else {
      await addLuckyGift({ giftId: formData.giftId, probability: formData.probability })
      fetchLuckyGiftList()
    }
    message.success('操作成功')
    modalVisible.value = false
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    modalLoading.value = false
  }
}

async function handleDelete(type: 'quick' | 'low' | 'lucky', record: any) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除此礼物配置吗？',
    onOk: async () => {
      try {
        if (type === 'quick') {
          await deleteQuickGift({ id: record.id })
          fetchQuickGiftList()
        } else if (type === 'low') {
          await deleteLowPriceGift({ id: record.id })
          fetchLowPriceGiftList()
        } else {
          await deleteLuckyGift({ id: record.id })
          fetchLuckyGiftList()
        }
        message.success('删除成功')
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  })
}
</script>

<style scoped>
.gift-page {
  padding: 0;
}

.tab-content {
  padding: 16px 0;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
