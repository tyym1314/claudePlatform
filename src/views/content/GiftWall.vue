<template>
  <div class="gift-wall-container">
    <a-card title="礼物墙配置" :bordered="false">
      <!-- Action Bar -->
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          添加配置
        </a-button>
      </div>

      <!-- Gift Wall Table -->
      <a-table
        :columns="columns"
        :data-source="giftWallList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'giftInfo'">
            <div>
              <div>ID: {{ record.giftId }}</div>
              <div v-if="record.giftName">名称: {{ record.giftName }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'displayType'">
            <a-tag :color="getDisplayTypeColor(record.displayType)">
              {{ getDisplayTypeText(record.displayType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'timeRange'">
            <div v-if="record.startTime || record.endTime">
              <div v-if="record.startTime">开始: {{ record.startTime }}</div>
              <div v-if="record.endTime">结束: {{ record.endTime }}</div>
            </div>
            <span v-else style="color: #999">永久</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除该配置吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="礼物ID" required>
          <a-input-number
            v-model:value="formData.giftId"
            placeholder="请输入礼物ID"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="展示类型" required>
          <a-select
            v-model:value="formData.displayType"
            placeholder="请选择展示类型"
          >
            <a-select-option :value="1">普通展示</a-select-option>
            <a-select-option :value="2">高亮展示</a-select-option>
            <a-select-option :value="3">推荐展示</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="显示位置" required>
          <a-input-number
            v-model:value="formData.position"
            :min="1"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="展示时间">
          <a-range-picker
            v-model:value="timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getGiftWallList,
  addGiftWall,
  updateGiftWall,
  deleteGiftWall,
  setGiftWallStatus
} from '@/api/content'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '礼物信息', key: 'giftInfo', width: 150 },
  { title: '展示类型', dataIndex: 'displayType', key: 'displayType', width: 120 },
  { title: '位置', dataIndex: 'position', key: 'position', width: 80 },
  { title: '展示时间', key: 'timeRange', width: 200 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

// State
const loading = ref(false)
const giftWallList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加配置')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  giftId: undefined,
  displayType: 1,
  position: 1
})

// Time range
const timeRange = ref<[Dayjs, Dayjs] | null>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getGiftWallList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.ec === 0) {
      giftWallList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load gift wall list failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle table change
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// Handle add
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '添加配置'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑配置'
  Object.assign(formData, {
    id: record.id,
    giftId: record.giftId,
    displayType: record.displayType,
    position: record.position
  })

  // Set time range
  if (record.startTime && record.endTime) {
    timeRange.value = [dayjs(record.startTime), dayjs(record.endTime)]
  } else {
    timeRange.value = null
  }

  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteGiftWall({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete gift wall failed:', error)
  }
}

// Handle status change
const handleStatusChange = async (record: any, checked: boolean) => {
  try {
    const res = await setGiftWallStatus({
      id: record.id,
      status: checked ? 1 : 0
    })
    if (res.ec === 0) {
      message.success('状态更新成功')
      loadData()
    }
  } catch (error) {
    console.error('Set gift wall status failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  // Validate
  if (!formData.giftId) {
    message.error('请输入礼物ID')
    return
  }
  if (!formData.displayType) {
    message.error('请选择展示类型')
    return
  }
  if (!formData.position) {
    message.error('请输入显示位置')
    return
  }

  const submitData: any = {
    giftId: formData.giftId,
    displayType: formData.displayType,
    position: formData.position
  }

  if (timeRange.value && timeRange.value.length === 2) {
    submitData.startTime = dayjs(timeRange.value[0]).format('YYYY-MM-DD HH:mm:ss')
    submitData.endTime = dayjs(timeRange.value[1]).format('YYYY-MM-DD HH:mm:ss')
  }

  try {
    if (isEdit.value) {
      const res = await updateGiftWall({ ...submitData, id: formData.id })
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addGiftWall(submitData)
      if (res.ec === 0) {
        message.success('添加成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit gift wall failed:', error)
  }
}

// Handle cancel
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    giftId: undefined,
    displayType: 1,
    position: 1
  })
  timeRange.value = null
}

// Get display type color
const getDisplayTypeColor = (type: number) => {
  const colorMap: Record<number, string> = {
    1: 'default',
    2: 'orange',
    3: 'blue'
  }
  return colorMap[type] || 'default'
}

// Get display type text
const getDisplayTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '普通展示',
    2: '高亮展示',
    3: '推荐展示'
  }
  return textMap[type] || '未知'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.gift-wall-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
