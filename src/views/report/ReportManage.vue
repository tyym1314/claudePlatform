<template>
  <div class="report-manage-container">
    <a-card title="举报管理" :bordered="false">
      <!-- Search and Action Bar -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="举报类型">
            <a-select
              v-model:value="searchForm.reportType"
              placeholder="请选择类型"
              style="width: 150px"
              allow-clear
            >
              <a-select-option value="USER">用户举报</a-select-option>
              <a-select-option value="DYNAMIC">动态举报</a-select-option>
              <a-select-option value="ROOM">房间举报</a-select-option>
              <a-select-option value="COMMENT">评论举报</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="处理状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 120px"
              allow-clear
            >
              <a-select-option :value="0">待处理</a-select-option>
              <a-select-option :value="1">已处理</a-select-option>
              <a-select-option :value="2">已忽略</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="举报时间">
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              style="width: 250px"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button @click="handleExport" :loading="exportLoading">导出</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <a-space>
          <a-button
            type="primary"
            @click="handleBatchProcess(1)"
            :disabled="selectedRowKeys.length === 0"
          >
            批量处理
          </a-button>
          <a-button
            @click="handleBatchProcess(2)"
            :disabled="selectedRowKeys.length === 0"
          >
            批量忽略
          </a-button>
          <span v-if="selectedRowKeys.length > 0" style="margin-left: 8px">
            已选择 {{ selectedRowKeys.length }} 条
          </span>
        </a-space>
      </div>

      <!-- Report Table -->
      <a-table
        :columns="columns"
        :data-source="reportList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys,
          onChange: onSelectChange
        }"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'reportType'">
            <a-tag>{{ getReportTypeText(record.reportType) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewDetail(record)">
                查看详情
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleProcess(record)"
                v-if="record.status === 0"
              >
                处理
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="举报详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentReport">
        <a-descriptions-item label="举报ID" :span="2">{{ currentReport.id }}</a-descriptions-item>
        <a-descriptions-item label="举报类型">
          <a-tag>{{ getReportTypeText(currentReport.reportType) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="举报状态">
          <a-tag :color="getStatusColor(currentReport.status)">
            {{ getStatusText(currentReport.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="举报人ID">{{ currentReport.reporterUserId }}</a-descriptions-item>
        <a-descriptions-item label="被举报ID">{{ currentReport.targetId }}</a-descriptions-item>
        <a-descriptions-item label="举报原因" :span="2">{{ currentReport.reason }}</a-descriptions-item>
        <a-descriptions-item label="举报详情" :span="2">{{ currentReport.description || '-' }}</a-descriptions-item>
        <a-descriptions-item label="截图" :span="2" v-if="currentReport.screenshots && currentReport.screenshots.length > 0">
          <a-space>
            <a-image
              v-for="(img, idx) in currentReport.screenshots"
              :key="idx"
              :width="100"
              :src="img"
            />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="举报时间" :span="2">{{ currentReport.createTime }}</a-descriptions-item>
        <a-descriptions-item label="处理时间" :span="2" v-if="currentReport.handleTime">
          {{ currentReport.handleTime }}
        </a-descriptions-item>
        <a-descriptions-item label="处理人" v-if="currentReport.handler">{{ currentReport.handler }}</a-descriptions-item>
        <a-descriptions-item label="处理结果" v-if="currentReport.handleResult">
          {{ currentReport.handleResult }}
        </a-descriptions-item>
        <a-descriptions-item label="处理备注" :span="2" v-if="currentReport.handleRemark">
          {{ currentReport.handleRemark }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- Process Modal -->
    <a-modal
      v-model:open="processVisible"
      title="处理举报"
      @ok="handleSubmitProcess"
      @cancel="handleCancelProcess"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="处理方式" required>
          <a-radio-group v-model:value="processForm.handleType">
            <a-radio :value="1">确认违规</a-radio>
            <a-radio :value="2">忽略举报</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="处理备注">
          <a-textarea
            v-model:value="processForm.remark"
            placeholder="请输入处理备注（可选）"
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
import dayjs, { Dayjs } from 'dayjs'
import {
  getReportList,
  getReportDetail,
  handleReport,
  batchHandleReports,
  exportReportData
} from '@/api/statistics'

// Table columns
const columns = [
  { title: '举报ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '举报类型', dataIndex: 'reportType', key: 'reportType', width: 120 },
  { title: '举报人ID', dataIndex: 'reporterUserId', key: 'reporterUserId', width: 100 },
  { title: '被举报ID', dataIndex: 'targetId', key: 'targetId', width: 100 },
  { title: '举报原因', dataIndex: 'reason', key: 'reason' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '举报时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

// Search form
const searchForm = reactive<any>({
  reportType: undefined,
  status: undefined
})

// Date range
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// State
const loading = ref(false)
const exportLoading = ref(false)
const reportList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Selection
const selectedRowKeys = ref<number[]>([])

// Detail modal
const detailVisible = ref(false)
const currentReport = ref<any>(null)

// Process modal
const processVisible = ref(false)
const processForm = reactive({
  reportId: undefined as number | undefined,
  handleType: 1,
  remark: ''
})

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getReportList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      reportType: searchForm.reportType,
      status: searchForm.status,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    if (res.ec === 0) {
      reportList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load report list failed:', error)
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
  searchForm.reportType = undefined
  searchForm.status = undefined
  dateRange.value = null
  pagination.current = 1
  loadData()
}

// Handle export
const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportReportData({
      reportType: searchForm.reportType,
      status: searchForm.status,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })

    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_data_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('导出成功')
  } catch (error) {
    console.error('Export report data failed:', error)
  } finally {
    exportLoading.value = false
  }
}

// Handle table change
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// Handle selection change
const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// Handle view detail
const handleViewDetail = async (record: any) => {
  try {
    const res = await getReportDetail({ reportId: record.id })
    if (res.ec === 0 && res.data) {
      currentReport.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('Get report detail failed:', error)
  }
}

// Handle process
const handleProcess = (record: any) => {
  processForm.reportId = record.id
  processForm.handleType = 1
  processForm.remark = ''
  processVisible.value = true
}

// Handle batch process
const handleBatchProcess = async (handleType: number) => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要处理的举报')
    return
  }

  try {
    const res = await batchHandleReports({
      reportIds: selectedRowKeys.value,
      handleType
    })
    if (res.ec === 0) {
      message.success('批量处理成功')
      selectedRowKeys.value = []
      loadData()
    }
  } catch (error) {
    console.error('Batch handle reports failed:', error)
  }
}

// Handle submit process
const handleSubmitProcess = async () => {
  try {
    const res = await handleReport({
      reportId: processForm.reportId!,
      handleType: processForm.handleType,
      remark: processForm.remark
    })
    if (res.ec === 0) {
      message.success('处理成功')
      processVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('Handle report failed:', error)
  }
}

// Handle cancel process
const handleCancelProcess = () => {
  processVisible.value = false
}

// Get report type text
const getReportTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'USER': '用户举报',
    'DYNAMIC': '动态举报',
    'ROOM': '房间举报',
    'COMMENT': '评论举报'
  }
  return textMap[type] || type
}

// Get status color
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'success',
    2: 'default'
  }
  return colorMap[status] || 'default'
}

// Get status text
const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '待处理',
    1: '已处理',
    2: '已忽略'
  }
  return textMap[status] || '未知'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.report-manage-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
