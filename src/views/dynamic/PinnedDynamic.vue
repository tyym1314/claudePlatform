<template>
  <div class="pinned-dynamic-container">
    <a-card title="置顶动态管理" :bordered="false">
      <!-- Action Bar -->
      <div class="action-bar">
        <a-button type="primary" @click="handleShowAddModal">
          <template #icon><PlusOutlined /></template>
          添加置顶
        </a-button>
      </div>

      <!-- Pinned Dynamic List -->
      <a-table
        :columns="columns"
        :data-source="pinnedList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'dynamicContent'">
            <div class="dynamic-content">
              <div class="content-text">{{ record.dynamicContent }}</div>
              <div class="content-images" v-if="record.images && record.images.length > 0">
                <a-image
                  v-for="(img, idx) in record.images.slice(0, 3)"
                  :key="idx"
                  :width="60"
                  :src="img"
                  style="margin-right: 8px"
                />
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'timeRange'">
            <div v-if="record.startTime || record.endTime">
              <div v-if="record.startTime">开始: {{ record.startTime }}</div>
              <div v-if="record.endTime">结束: {{ record.endTime }}</div>
            </div>
            <span v-else style="color: #999">永久</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record)">
              {{ getStatusText(record) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定取消置顶吗？" @confirm="handleUnpin(record.id)">
                <a-button type="link" danger size="small">取消置顶</a-button>
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
      width="700px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="动态ID" required v-if="!isEdit">
          <a-space>
            <a-input-number
              v-model:value="formData.dynamicId"
              placeholder="请输入动态ID"
              style="width: 200px"
              @change="handleDynamicIdChange"
            />
            <a-button @click="handleSearchDynamic" :loading="searchLoading">查询</a-button>
          </a-space>
        </a-form-item>

        <a-form-item label="动态内容" v-if="dynamicPreview">
          <div class="dynamic-preview">
            <div class="preview-content">{{ dynamicPreview.content }}</div>
            <div class="preview-images" v-if="dynamicPreview.images && dynamicPreview.images.length > 0">
              <a-image
                v-for="(img, idx) in dynamicPreview.images"
                :key="idx"
                :width="80"
                :src="img"
                style="margin-right: 8px"
              />
            </div>
            <div class="preview-info">
              <span>用户ID: {{ dynamicPreview.userId }}</span>
              <span style="margin-left: 16px">发布时间: {{ dynamicPreview.createTime }}</span>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="置顶位置" required>
          <a-input-number
            v-model:value="formData.position"
            :min="1"
            :max="100"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="置顶时间">
          <a-range-picker
            v-model:value="timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            不设置时间则永久置顶
          </div>
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
  getPinnedDynamicList,
  pinDynamic,
  unpinDynamic,
  updatePinnedDynamic,
  getDynamicDetail
} from '@/api/dynamic'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '动态ID', dataIndex: 'dynamicId', key: 'dynamicId', width: 100 },
  { title: '动态内容', dataIndex: 'dynamicContent', key: 'dynamicContent', width: 300 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '位置', dataIndex: 'position', key: 'position', width: 80 },
  { title: '置顶时间', key: 'timeRange', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150 }
]

// State
const loading = ref(false)
const searchLoading = ref(false)
const pinnedList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加置顶')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  dynamicId: undefined,
  position: 1,
  startTime: undefined,
  endTime: undefined
})

// Time range
const timeRange = ref<[Dayjs, Dayjs] | null>(null)

// Dynamic preview
const dynamicPreview = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getPinnedDynamicList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.ec === 0) {
      pinnedList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load pinned dynamic list failed:', error)
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

// Handle show add modal
const handleShowAddModal = () => {
  isEdit.value = false
  modalTitle.value = '添加置顶'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑置顶'
  Object.assign(formData, {
    id: record.id,
    dynamicId: record.dynamicId,
    position: record.position,
    startTime: record.startTime,
    endTime: record.endTime
  })

  // Set time range
  if (record.startTime && record.endTime) {
    timeRange.value = [dayjs(record.startTime), dayjs(record.endTime)]
  } else {
    timeRange.value = null
  }

  // Set preview
  dynamicPreview.value = {
    content: record.dynamicContent,
    images: record.images,
    userId: record.userId,
    createTime: record.createTime
  }

  modalVisible.value = true
}

// Handle dynamic id change
const handleDynamicIdChange = () => {
  dynamicPreview.value = null
}

// Handle search dynamic
const handleSearchDynamic = async () => {
  if (!formData.dynamicId) {
    message.error('请输入动态ID')
    return
  }

  searchLoading.value = true
  try {
    const res = await getDynamicDetail({ dynamicId: formData.dynamicId })
    if (res.ec === 0 && res.data) {
      dynamicPreview.value = {
        content: res.data.content,
        images: res.data.images,
        userId: res.data.userId,
        createTime: res.data.createTime
      }
      message.success('查询成功')
    } else {
      message.error('未找到该动态')
      dynamicPreview.value = null
    }
  } catch (error) {
    console.error('Search dynamic failed:', error)
    dynamicPreview.value = null
  } finally {
    searchLoading.value = false
  }
}

// Handle unpin
const handleUnpin = async (id: number) => {
  try {
    const res = await unpinDynamic({ id })
    if (res.ec === 0) {
      message.success('取消置顶成功')
      loadData()
    }
  } catch (error) {
    console.error('Unpin dynamic failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  // Validate
  if (!formData.dynamicId) {
    message.error('请输入动态ID')
    return
  }
  if (!formData.position) {
    message.error('请输入置顶位置')
    return
  }
  if (!isEdit.value && !dynamicPreview.value) {
    message.error('请先查询动态')
    return
  }

  // Prepare data
  const submitData: any = {
    dynamicId: formData.dynamicId,
    position: formData.position
  }

  if (timeRange.value && timeRange.value.length === 2) {
    submitData.startTime = dayjs(timeRange.value[0]).format('YYYY-MM-DD HH:mm:ss')
    submitData.endTime = dayjs(timeRange.value[1]).format('YYYY-MM-DD HH:mm:ss')
  }

  try {
    if (isEdit.value) {
      const res = await updatePinnedDynamic({ ...submitData, id: formData.id })
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await pinDynamic(submitData)
      if (res.ec === 0) {
        message.success('添加置顶成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit pinned dynamic failed:', error)
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
    dynamicId: undefined,
    position: 1,
    startTime: undefined,
    endTime: undefined
  })
  timeRange.value = null
  dynamicPreview.value = null
}

// Get status color
const getStatusColor = (record: any) => {
  const now = new Date().getTime()
  if (record.startTime && new Date(record.startTime).getTime() > now) {
    return 'default'
  }
  if (record.endTime && new Date(record.endTime).getTime() < now) {
    return 'error'
  }
  return 'success'
}

// Get status text
const getStatusText = (record: any) => {
  const now = new Date().getTime()
  if (record.startTime && new Date(record.startTime).getTime() > now) {
    return '未开始'
  }
  if (record.endTime && new Date(record.endTime).getTime() < now) {
    return '已过期'
  }
  return '进行中'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.pinned-dynamic-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 16px;
}

.dynamic-content {
  .content-text {
    margin-bottom: 8px;
    word-break: break-all;
  }

  .content-images {
    display: flex;
    gap: 8px;
  }
}

.dynamic-preview {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;

  .preview-content {
    margin-bottom: 8px;
    word-break: break-all;
  }

  .preview-images {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .preview-info {
    font-size: 12px;
    color: #999;
  }
}
</style>
