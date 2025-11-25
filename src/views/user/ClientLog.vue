<template>
  <div class="client-log-container">
    <a-card title="客户端日志查询" :bordered="false">
      <!-- Search Filters -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="用户ID">
            <a-input
              v-model:value="searchForm.userId"
              placeholder="请输入用户ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Log Table -->
      <a-table
        :columns="columns"
        :data-source="logList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'logLevel'">
            <a-tag :color="getLogLevelColor(record.logLevel)">
              {{ record.logLevel }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'logType'">
            <a-tag>{{ record.logType }}</a-tag>
          </template>
          <template v-else-if="column.key === 'message'">
            <div class="log-message">
              {{ record.message }}
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              查看详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="日志详情"
      width="900px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentLog">
        <a-descriptions-item label="日志ID" :span="2">{{ currentLog.id }}</a-descriptions-item>
        <a-descriptions-item label="用户ID">{{ currentLog.userId }}</a-descriptions-item>
        <a-descriptions-item label="设备ID">{{ currentLog.deviceId }}</a-descriptions-item>
        <a-descriptions-item label="日志级别">
          <a-tag :color="getLogLevelColor(currentLog.logLevel)">
            {{ currentLog.logLevel }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="日志类型">
          <a-tag>{{ currentLog.logType }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="客户端版本">{{ currentLog.clientVersion }}</a-descriptions-item>
        <a-descriptions-item label="系统版本">{{ currentLog.osVersion }}</a-descriptions-item>
        <a-descriptions-item label="设备型号" :span="2">{{ currentLog.deviceModel }}</a-descriptions-item>
        <a-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</a-descriptions-item>
        <a-descriptions-item label="网络类型">{{ currentLog.networkType }}</a-descriptions-item>
        <a-descriptions-item label="日志消息" :span="2">
          <pre class="log-content">{{ currentLog.message }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="堆栈信息" :span="2" v-if="currentLog.stackTrace">
          <pre class="log-content">{{ currentLog.stackTrace }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="额外信息" :span="2" v-if="currentLog.extraData">
          <pre class="log-content">{{ formatJSON(currentLog.extraData) }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">{{ currentLog.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { getClientLogList } from '@/api/user'

// Table columns
const columns = [
  { title: '日志ID', dataIndex: 'id', key: 'id', width: 100, fixed: 'left' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '日志级别', dataIndex: 'logLevel', key: 'logLevel', width: 100 },
  { title: '日志类型', dataIndex: 'logType', key: 'logType', width: 120 },
  { title: '日志消息', key: 'message', width: 400 },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 200 },
  { title: '客户端版本', dataIndex: 'clientVersion', key: 'clientVersion', width: 120 },
  { title: 'IP地址', dataIndex: 'ipAddress', key: 'ipAddress', width: 150 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

// Search form
const searchForm = reactive<any>({
  userId: ''
})

// State
const loading = ref(false)
const logList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Detail modal
const detailVisible = ref(false)
const currentLog = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getClientLogList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      userId: searchForm.userId || undefined
    })
    if (res.ec === 0) {
      logList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load client log list failed:', error)
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
  searchForm.userId = ''
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
const handleViewDetail = (record: any) => {
  currentLog.value = record
  detailVisible.value = true
}

// Get log level color
const getLogLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'DEBUG': 'default',
    'INFO': 'blue',
    'WARN': 'orange',
    'ERROR': 'red',
    'FATAL': 'purple'
  }
  return colorMap[level] || 'default'
}

// Format JSON
const formatJSON = (data: any) => {
  try {
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), null, 2)
    }
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return data
  }
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.client-log-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.log-message {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}
</style>
