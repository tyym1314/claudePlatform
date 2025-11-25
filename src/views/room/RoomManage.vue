<template>
  <div class="room-manage-container">
    <a-card title="房间管理" :bordered="false">
      <!-- Search Filters -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="房间ID">
            <a-input-number
              v-model:value="searchForm.roomId"
              placeholder="请输入房间ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="主播ID">
            <a-input-number
              v-model:value="searchForm.userId"
              placeholder="请输入主播ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="房间名称">
            <a-input
              v-model:value="searchForm.roomName"
              placeholder="请输入房间名称"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="房间状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 120px"
              allow-clear
            >
              <a-select-option :value="1">直播中</a-select-option>
              <a-select-option :value="0">未开播</a-select-option>
              <a-select-option :value="2">已关闭</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Room List -->
      <a-table
        :columns="columns"
        :data-source="roomList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="roomId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'coverImage'">
            <a-image :width="80" :src="record.coverImage" />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'onlineCount'">
            {{ record.onlineCount || 0 }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewDetail(record)">
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleCloseRoom(record)"
                v-if="record.status === 1"
              >
                关闭房间
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleOpenRoom(record)"
                v-if="record.status === 2"
              >
                开启房间
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="房间详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentRoom">
        <a-descriptions-item label="房间ID">{{ currentRoom.roomId }}</a-descriptions-item>
        <a-descriptions-item label="房间名称">{{ currentRoom.roomName }}</a-descriptions-item>
        <a-descriptions-item label="主播ID">{{ currentRoom.userId }}</a-descriptions-item>
        <a-descriptions-item label="主播昵称">{{ currentRoom.userName }}</a-descriptions-item>
        <a-descriptions-item label="房间状态">
          <a-tag :color="getStatusColor(currentRoom.status)">
            {{ getStatusText(currentRoom.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="在线人数">{{ currentRoom.onlineCount || 0 }}</a-descriptions-item>
        <a-descriptions-item label="房间封面" :span="2">
          <a-image :width="200" :src="currentRoom.coverImage" />
        </a-descriptions-item>
        <a-descriptions-item label="房间描述" :span="2">
          {{ currentRoom.description || '暂无描述' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">
          {{ currentRoom.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="开播时间" :span="2" v-if="currentRoom.startTime">
          {{ currentRoom.startTime }}
        </a-descriptions-item>
        <a-descriptions-item label="累计时长">{{ formatDuration(currentRoom.totalDuration) }}</a-descriptions-item>
        <a-descriptions-item label="累计收益">${{ (currentRoom.totalIncome / 100).toFixed(2) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- Edit Modal -->
    <a-modal
      v-model:open="editVisible"
      title="编辑房间"
      @ok="handleSubmitEdit"
      @cancel="handleCancelEdit"
    >
      <a-form :model="editForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="房间名称">
          <a-input v-model:value="editForm.roomName" placeholder="请输入房间名称" />
        </a-form-item>
        <a-form-item label="房间描述">
          <a-textarea
            v-model:value="editForm.description"
            placeholder="请输入房间描述"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Close Room Modal -->
    <a-modal
      v-model:open="closeVisible"
      title="关闭房间"
      @ok="handleSubmitClose"
      @cancel="handleCancelClose"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="关闭原因">
          <a-textarea
            v-model:value="closeReason"
            placeholder="请输入关闭原因（可选）"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  getRoomList,
  getRoomDetail,
  closeRoom,
  openRoom,
  updateRoomInfo
} from '@/api/room'

// Table columns
const columns = [
  { title: '房间ID', dataIndex: 'roomId', key: 'roomId', width: 100 },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName' },
  { title: '房间封面', dataIndex: 'coverImage', key: 'coverImage', width: 120 },
  { title: '主播ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '主播昵称', dataIndex: 'userName', key: 'userName' },
  { title: '房间状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '在线人数', key: 'onlineCount', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 250 }
]

// Search form
const searchForm = reactive<any>({
  roomId: undefined,
  userId: undefined,
  roomName: '',
  status: undefined
})

// State
const loading = ref(false)
const roomList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Detail modal
const detailVisible = ref(false)
const currentRoom = ref<any>(null)

// Edit modal
const editVisible = ref(false)
const editForm = reactive<any>({
  roomId: undefined,
  roomName: '',
  description: ''
})

// Close modal
const closeVisible = ref(false)
const closeRoomId = ref<number>()
const closeReason = ref('')

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoomList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      roomId: searchForm.roomId,
      userId: searchForm.userId,
      roomName: searchForm.roomName,
      status: searchForm.status
    })
    if (res.ec === 0) {
      roomList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load room list failed:', error)
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
  searchForm.roomId = undefined
  searchForm.userId = undefined
  searchForm.roomName = ''
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

// Handle view detail
const handleViewDetail = async (record: any) => {
  try {
    const res = await getRoomDetail({ roomId: record.roomId })
    if (res.ec === 0 && res.data) {
      currentRoom.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('Get room detail failed:', error)
  }
}

// Handle edit
const handleEdit = (record: any) => {
  editForm.roomId = record.roomId
  editForm.roomName = record.roomName
  editForm.description = record.description || ''
  editVisible.value = true
}

// Handle submit edit
const handleSubmitEdit = async () => {
  try {
    const res = await updateRoomInfo({
      roomId: editForm.roomId,
      roomName: editForm.roomName,
      description: editForm.description
    })
    if (res.ec === 0) {
      message.success('更新成功')
      editVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('Update room info failed:', error)
  }
}

// Handle cancel edit
const handleCancelEdit = () => {
  editVisible.value = false
}

// Handle close room
const handleCloseRoom = (record: any) => {
  closeRoomId.value = record.roomId
  closeReason.value = ''
  closeVisible.value = true
}

// Handle submit close
const handleSubmitClose = async () => {
  try {
    const res = await closeRoom({
      roomId: closeRoomId.value!,
      reason: closeReason.value
    })
    if (res.ec === 0) {
      message.success('房间已关闭')
      closeVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('Close room failed:', error)
  }
}

// Handle cancel close
const handleCancelClose = () => {
  closeVisible.value = false
}

// Handle open room
const handleOpenRoom = async (record: any) => {
  try {
    const res = await openRoom({ roomId: record.roomId })
    if (res.ec === 0) {
      message.success('房间已开启')
      loadData()
    }
  } catch (error) {
    console.error('Open room failed:', error)
  }
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
    0: '未开播',
    1: '直播中',
    2: '已关闭'
  }
  return textMap[status] || '未知'
}

// Format duration
const formatDuration = (seconds: number) => {
  if (!seconds) return '0分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.room-manage-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
