<template>
  <div class="salary-record-container">
    <a-card title="工资发放记录" :bordered="false">
      <!-- Search Filters -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="公会ID">
            <a-input-number
              v-model:value="searchForm.guildId"
              placeholder="请输入公会ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input-number
              v-model:value="searchForm.userId"
              placeholder="请输入用户ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="月份">
            <a-month-picker
              v-model:value="searchForm.month"
              placeholder="选择月份"
              format="YYYY-MM"
              style="width: 150px"
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

      <!-- Summary Cards -->
      <a-row :gutter="16" style="margin-top: 16px; margin-bottom: 16px">
        <a-col :span="8">
          <a-card size="small">
            <a-statistic
              title="本月发薪总额"
              :value="summary.totalAmount"
              :precision="2"
              prefix="$"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small">
            <a-statistic
              title="本月发薪人数"
              :value="summary.totalCount"
              suffix="人"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small">
            <a-statistic
              title="待审核数量"
              :value="summary.pendingCount"
              suffix="条"
              :value-style="{ color: '#faad14' }"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- Action Bar -->
      <div class="action-bar">
        <a-space>
          <a-button
            type="primary"
            @click="handleBatchApprove"
            :disabled="selectedRowKeys.length === 0"
          >
            批量通过
          </a-button>
          <a-button
            danger
            @click="handleBatchReject"
            :disabled="selectedRowKeys.length === 0"
          >
            批量驳回
          </a-button>
          <span v-if="selectedRowKeys.length > 0" style="margin-left: 8px">
            已选择 {{ selectedRowKeys.length }} 条
          </span>
        </a-space>
      </div>

      <!-- Salary Records Table -->
      <a-table
        :columns="columns"
        :data-source="recordList"
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
          <template v-if="column.key === 'salaryAmount'">
            ${{ (record.salaryAmount / 100).toFixed(2) }}
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
                @click="handleApprove(record)"
                v-if="record.status === 0"
              >
                审核
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="工资详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentRecord">
        <a-descriptions-item label="记录ID">{{ currentRecord.id }}</a-descriptions-item>
        <a-descriptions-item label="用户ID">{{ currentRecord.userId }}</a-descriptions-item>
        <a-descriptions-item label="公会ID">{{ currentRecord.guildId }}</a-descriptions-item>
        <a-descriptions-item label="公会名称">{{ currentRecord.guildName }}</a-descriptions-item>
        <a-descriptions-item label="月份">{{ currentRecord.month }}</a-descriptions-item>
        <a-descriptions-item label="基础工资">
          ${{ (currentRecord.baseSalary / 100).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="提成">
          ${{ (currentRecord.commission / 100).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="总金额">
          ${{ (currentRecord.salaryAmount / 100).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="状态" :span="2">
          <a-tag :color="getStatusColor(currentRecord.status)">
            {{ getStatusText(currentRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">
          {{ currentRecord.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="审核时间" :span="2" v-if="currentRecord.approveTime">
          {{ currentRecord.approveTime }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2" v-if="currentRecord.remark">
          {{ currentRecord.remark }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- Approve Modal -->
    <a-modal
      v-model:open="approveVisible"
      title="审核工资"
      @ok="handleSubmitApproval"
      @cancel="handleCancelApproval"
    >
      <a-form :model="approveForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model:value="approveForm.status">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="approveForm.remark"
            placeholder="请输入备注（可选）"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getSalaryRecordList,
  getSalaryRecordDetail,
  approveSalary,
  batchApproveSalary,
  exportSalaryRecords
} from '@/api/guild'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '公会ID', dataIndex: 'guildId', key: 'guildId', width: 100 },
  { title: '公会名称', dataIndex: 'guildName', key: 'guildName' },
  { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
  { title: '工资金额', dataIndex: 'salaryAmount', key: 'salaryAmount', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

// Search form
const searchForm = reactive<any>({
  guildId: undefined,
  userId: undefined,
  month: null
})

// State
const loading = ref(false)
const exportLoading = ref(false)
const recordList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Summary
const summary = reactive({
  totalAmount: 0,
  totalCount: 0,
  pendingCount: 0
})

// Selection
const selectedRowKeys = ref<number[]>([])

// Detail modal
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

// Approve modal
const approveVisible = ref(false)
const approveForm = reactive<any>({
  recordId: undefined,
  status: 1,
  remark: ''
})

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getSalaryRecordList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      guildId: searchForm.guildId,
      userId: searchForm.userId,
      month: searchForm.month ? dayjs(searchForm.month).format('YYYY-MM') : undefined
    })
    if (res.ec === 0) {
      recordList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0

      // Update summary
      summary.totalAmount = (res.data.summary?.totalAmount || 0) / 100
      summary.totalCount = res.data.summary?.totalCount || 0
      summary.pendingCount = res.data.summary?.pendingCount || 0
    }
  } catch (error) {
    console.error('Load salary record list failed:', error)
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
  searchForm.guildId = undefined
  searchForm.userId = undefined
  searchForm.month = null
  pagination.current = 1
  loadData()
}

// Handle export
const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportSalaryRecords({
      guildId: searchForm.guildId,
      month: searchForm.month ? dayjs(searchForm.month).format('YYYY-MM') : undefined
    })

    // Create download link
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `salary_records_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('导出成功')
  } catch (error) {
    console.error('Export salary records failed:', error)
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
    const res = await getSalaryRecordDetail({ recordId: record.id })
    if (res.ec === 0 && res.data) {
      currentRecord.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('Get salary record detail failed:', error)
  }
}

// Handle approve
const handleApprove = (record: any) => {
  approveForm.recordId = record.id
  approveForm.status = 1
  approveForm.remark = ''
  approveVisible.value = true
}

// Handle submit approval
const handleSubmitApproval = async () => {
  try {
    const res = await approveSalary({
      recordId: approveForm.recordId,
      status: approveForm.status,
      remark: approveForm.remark
    })
    if (res.ec === 0) {
      message.success('审核成功')
      approveVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('Approve salary failed:', error)
  }
}

// Handle cancel approval
const handleCancelApproval = () => {
  approveVisible.value = false
}

// Handle batch approve
const handleBatchApprove = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要审核的记录')
    return
  }

  try {
    const res = await batchApproveSalary({
      recordIds: selectedRowKeys.value,
      status: 1
    })
    if (res.ec === 0) {
      message.success('批量审核成功')
      selectedRowKeys.value = []
      loadData()
    }
  } catch (error) {
    console.error('Batch approve salary failed:', error)
  }
}

// Handle batch reject
const handleBatchReject = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要驳回的记录')
    return
  }

  try {
    const res = await batchApproveSalary({
      recordIds: selectedRowKeys.value,
      status: 2
    })
    if (res.ec === 0) {
      message.success('批量驳回成功')
      selectedRowKeys.value = []
      loadData()
    }
  } catch (error) {
    console.error('Batch reject salary failed:', error)
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
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return textMap[status] || '未知'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.salary-record-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
