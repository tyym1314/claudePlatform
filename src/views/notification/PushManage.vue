<template>
  <div class="push-manage-container">
    <a-card title="推送通知管理" :bordered="false">
      <!-- Search and Action Bar -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="标题">
            <a-input
              v-model:value="searchForm.title"
              placeholder="请输入标题"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="推送类型">
            <a-select
              v-model:value="searchForm.pushType"
              placeholder="请选择类型"
              style="width: 120px"
              allow-clear
            >
              <a-select-option :value="1">立即推送</a-select-option>
              <a-select-option :value="2">定时推送</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width": 120px"
              allow-clear
            >
              <a-select-option :value="0">待推送</a-select-option>
              <a-select-option :value="1">已推送</a-select-option>
              <a-select-option :value="2">已取消</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                新建推送
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Notification Table -->
      <a-table
        :columns="columns"
        :data-source="notificationList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'pushType'">
            <a-tag :color="record.pushType === 1 ? 'blue' : 'orange'">
              {{ record.pushType === 1 ? '立即推送' : '定时推送' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'targetType'">
            {{ getTargetTypeText(record.targetType) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewStatistics(record)">
                统计
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleSend(record)"
                v-if="record.status === 0 && record.pushType === 2"
              >
                立即推送
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleEdit(record)"
                v-if="record.status === 0"
              >
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleCancel(record)"
                v-if="record.status === 0"
              >
                取消
              </a-button>
              <a-popconfirm
                title="确定删除该推送吗？"
                @confirm="handleDelete(record.id)"
                v-if="record.status !== 0"
              >
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
      width="700px"
      @ok="handleSubmit"
      @cancel="handleCancelModal"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="推送标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入推送标题" />
        </a-form-item>
        <a-form-item label="推送内容" required>
          <a-textarea
            v-model:value="formData.content"
            placeholder="请输入推送内容"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="推送类型" required>
          <a-radio-group v-model:value="formData.pushType">
            <a-radio :value="1">立即推送</a-radio>
            <a-radio :value="2">定时推送</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="推送时间" v-if="formData.pushType === 2" required>
          <a-date-picker
            v-model:value="pushTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="推送对象" required>
          <a-radio-group v-model:value="formData.targetType" @change="handleTargetTypeChange">
            <a-radio :value="1">全部用户</a-radio>
            <a-radio :value="2">指定用户</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="用户ID列表" v-if="formData.targetType === 2" required>
          <a-textarea
            v-model:value="targetIdsInput"
            placeholder="请输入用户ID，多个ID用逗号分隔"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="跳转类型">
          <a-select v-model:value="formData.jumpType" placeholder="请选择跳转类型">
            <a-select-option :value="0">无跳转</a-select-option>
            <a-select-option :value="1">跳转H5</a-select-option>
            <a-select-option :value="2">跳转页面</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="跳转地址" v-if="formData.jumpType > 0">
          <a-input v-model:value="formData.jumpUrl" placeholder="请输入跳转地址" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Statistics Modal -->
    <a-modal
      v-model:open="statisticsVisible"
      title="推送统计"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentStatistics">
        <a-descriptions-item label="推送ID">{{ currentStatistics.notificationId }}</a-descriptions-item>
        <a-descriptions-item label="推送标题">{{ currentStatistics.title }}</a-descriptions-item>
        <a-descriptions-item label="目标用户数">{{ currentStatistics.targetUserCount }}</a-descriptions-item>
        <a-descriptions-item label="推送成功数">{{ currentStatistics.pushSuccessCount }}</a-descriptions-item>
        <a-descriptions-item label="推送失败数">{{ currentStatistics.pushFailCount }}</a-descriptions-item>
        <a-descriptions-item label="已读数">{{ currentStatistics.readCount }}</a-descriptions-item>
        <a-descriptions-item label="点击数">{{ currentStatistics.clickCount }}</a-descriptions-item>
        <a-descriptions-item label="点击率">{{ currentStatistics.clickRate }}%</a-descriptions-item>
        <a-descriptions-item label="推送时间" :span="2">{{ currentStatistics.pushTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getNotificationList,
  addNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  cancelNotification,
  getNotificationStatistics
} from '@/api/notification'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '推送标题', dataIndex: 'title', key: 'title' },
  { title: '推送类型', dataIndex: 'pushType', key: 'pushType', width: 120 },
  { title: '推送对象', dataIndex: 'targetType', key: 'targetType', width: 120 },
  { title: '推送时间', dataIndex: 'pushTime', key: 'pushTime', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 250 }
]

// Search form
const searchForm = reactive<any>({
  title: '',
  pushType: undefined,
  status: undefined
})

// State
const loading = ref(false)
const notificationList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('新建推送')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  title: '',
  content: '',
  pushType: 1,
  targetType: 1,
  targetIds: [],
  pushTime: '',
  jumpType: 0,
  jumpUrl: ''
})

// Target IDs input
const targetIdsInput = ref('')

// Push time
const pushTime = ref<Dayjs | null>(null)

// Statistics modal
const statisticsVisible = ref(false)
const currentStatistics = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getNotificationList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      title: searchForm.title || undefined,
      pushType: searchForm.pushType,
      status: searchForm.status
    })
    if (res.ec === 0) {
      notificationList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load notification list failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle search
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// Handle reset
const handleReset = () => {
  searchForm.title = ''
  searchForm.pushType = undefined
  searchForm.status = undefined
  pagination.current = 1
  loadData()
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
  modalTitle.value = '新建推送'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑推送'
  Object.assign(formData, {
    id: record.id,
    title: record.title,
    content: record.content,
    pushType: record.pushType,
    targetType: record.targetType,
    jumpType: record.jumpType || 0,
    jumpUrl: record.jumpUrl || ''
  })

  if (record.targetIds && record.targetIds.length > 0) {
    targetIdsInput.value = record.targetIds.join(',')
  }

  if (record.pushTime) {
    pushTime.value = dayjs(record.pushTime)
  }

  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteNotification({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete notification failed:', error)
  }
}

// Handle send
const handleSend = async (record: any) => {
  Modal.confirm({
    title: '确认推送',
    content: `确定要立即推送 "${record.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await sendNotification({ id: record.id })
        if (res.ec === 0) {
          message.success('推送成功')
          loadData()
        }
      } catch (error) {
        console.error('Send notification failed:', error)
      }
    }
  })
}

// Handle cancel
const handleCancel = async (record: any) => {
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消推送 "${record.title}" 吗？`,
    onOk: async () => {
      try {
        const res = await cancelNotification({ id: record.id })
        if (res.ec === 0) {
          message.success('取消成功')
          loadData()
        }
      } catch (error) {
        console.error('Cancel notification failed:', error)
      }
    }
  })
}

// Handle view statistics
const handleViewStatistics = async (record: any) => {
  try {
    const res = await getNotificationStatistics({ notificationId: record.id })
    if (res.ec === 0 && res.data) {
      currentStatistics.value = res.data
      statisticsVisible.value = true
    }
  } catch (error) {
    console.error('Get notification statistics failed:', error)
  }
}

// Handle target type change
const handleTargetTypeChange = () => {
  targetIdsInput.value = ''
}

// Handle submit
const handleSubmit = async () => {
  if (!formData.title) {
    message.error('请输入推送标题')
    return
  }
  if (!formData.content) {
    message.error('请输入推送内容')
    return
  }
  if (formData.pushType === 2 && !pushTime.value) {
    message.error('请选择推送时间')
    return
  }
  if (formData.targetType === 2 && !targetIdsInput.value) {
    message.error('请输入用户ID列表')
    return
  }

  const submitData: any = {
    title: formData.title,
    content: formData.content,
    pushType: formData.pushType,
    targetType: formData.targetType,
    jumpType: formData.jumpType,
    jumpUrl: formData.jumpUrl
  }

  if (formData.pushType === 2) {
    submitData.pushTime = dayjs(pushTime.value).format('YYYY-MM-DD HH:mm:ss')
  }

  if (formData.targetType === 2) {
    submitData.targetIds = targetIdsInput.value.split(',').map(id => id.trim())
  }

  try {
    if (isEdit.value) {
      const res = await updateNotification({ ...submitData, id: formData.id })
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addNotification(submitData)
      if (res.ec === 0) {
        message.success('创建成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit notification failed:', error)
  }
}

// Handle cancel modal
const handleCancelModal = () => {
  modalVisible.value = false
  resetForm()
}

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    title: '',
    content: '',
    pushType: 1,
    targetType: 1,
    targetIds: [],
    pushTime: '',
    jumpType: 0,
    jumpUrl: ''
  })
  targetIdsInput.value = ''
  pushTime.value = null
}

// Get target type text
const getTargetTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '全部用户',
    2: '指定用户'
  }
  return textMap[type] || '未知'
}

// Get status color
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'default',
    1: 'success',
    2: 'error'
  }
  return colorMap[status] || 'default'
}

// Get status text
const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '待推送',
    1: '已推送',
    2: '已取消'
  }
  return textMap[status] || '未知'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.push-manage-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
