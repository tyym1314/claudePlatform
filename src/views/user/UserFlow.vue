<template>
  <div class="user-flow-container">
    <a-card title="用户流水查询" :bordered="false">
      <!-- Search Filters -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="用户ID" required>
            <a-input
              v-model:value="searchForm.userId"
              placeholder="请输入用户ID"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="流水类型">
            <a-radio-group v-model:value="searchForm.flowType" button-style="solid">
              <a-radio-button value="diamond">钻石流水</a-radio-button>
              <a-radio-button value="gold">金币流水</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="查询时间">
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

      <!-- Summary Cards -->
      <a-row :gutter="16" style="margin-top: 16px; margin-bottom: 16px" v-if="summary">
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="当前余额"
              :value="summary.currentBalance"
              :precision="0"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="总收入"
              :value="summary.totalIncome"
              :precision="0"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="总支出"
              :value="summary.totalExpense"
              :precision="0"
              :value-style="{ color: '#cf1322' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="流水记录数"
              :value="pagination.total"
              suffix="条"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- Flow Table -->
      <a-table
        :columns="currentColumns"
        :data-source="flowList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'changeAmount'">
            <span :style="{ color: record.changeAmount > 0 ? '#3f8600' : '#cf1322' }">
              {{ record.changeAmount > 0 ? '+' : '' }}{{ record.changeAmount }}
            </span>
          </template>
          <template v-else-if="column.key === 'changeType'">
            <a-tag :color="getChangeTypeColor(record.changeType)">
              {{ record.changeTypeName || record.changeType }}
            </a-tag>
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
      title="流水详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered v-if="currentFlow">
        <a-descriptions-item label="流水ID">{{ currentFlow.id }}</a-descriptions-item>
        <a-descriptions-item label="用户ID">{{ currentFlow.userId }}</a-descriptions-item>
        <a-descriptions-item label="变动类型">
          <a-tag :color="getChangeTypeColor(currentFlow.changeType)">
            {{ currentFlow.changeTypeName || currentFlow.changeType }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="变动数量">
          <span :style="{ color: currentFlow.changeAmount > 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }">
            {{ currentFlow.changeAmount > 0 ? '+' : '' }}{{ currentFlow.changeAmount }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="变动前余额">{{ currentFlow.beforeBalance }}</a-descriptions-item>
        <a-descriptions-item label="变动后余额">{{ currentFlow.afterBalance }}</a-descriptions-item>
        <a-descriptions-item label="来源">{{ currentFlow.source || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ currentFlow.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ currentFlow.operator || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentFlow.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { getBalanceDetail, getGoldDetail, exportRecord } from '@/api/user'

// Diamond columns
const diamondColumns = [
  { title: '流水ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '变动类型', dataIndex: 'changeType', key: 'changeType', width: 120 },
  { title: '变动数量', dataIndex: 'changeAmount', key: 'changeAmount', width: 120 },
  { title: '变动前', dataIndex: 'beforeBalance', key: 'beforeBalance', width: 120 },
  { title: '变动后', dataIndex: 'afterBalance', key: 'afterBalance', width: 120 },
  { title: '来源', dataIndex: 'source', key: 'source' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

// Gold columns
const goldColumns = [
  { title: '流水ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '变动类型', dataIndex: 'changeType', key: 'changeType', width: 120 },
  { title: '变动数量', dataIndex: 'changeAmount', key: 'changeAmount', width: 120 },
  { title: '变动前', dataIndex: 'beforeBalance', key: 'beforeBalance', width: 120 },
  { title: '变动后', dataIndex: 'afterBalance', key: 'afterBalance', width: 120 },
  { title: '来源', dataIndex: 'source', key: 'source' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100 }
]

// Current columns
const currentColumns = computed(() => {
  return searchForm.flowType === 'diamond' ? diamondColumns : goldColumns
})

// Search form
const searchForm = reactive<any>({
  userId: '',
  flowType: 'diamond'
})

// Date range
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// State
const loading = ref(false)
const exportLoading = ref(false)
const flowList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Summary
const summary = ref<any>(null)

// Detail modal
const detailVisible = ref(false)
const currentFlow = ref<any>(null)

// Load diamond flow
const loadDiamondFlow = async () => {
  loading.value = true
  try {
    const res = await getBalanceDetail({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      queryUserId: searchForm.userId,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    if (res.ec === 0) {
      flowList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0

      // Update summary
      if (res.data.summary) {
        summary.value = {
          currentBalance: res.data.summary.currentBalance || 0,
          totalIncome: res.data.summary.totalIncome || 0,
          totalExpense: res.data.summary.totalExpense || 0
        }
      }
    }
  } catch (error) {
    console.error('Load diamond flow failed:', error)
  } finally {
    loading.value = false
  }
}

// Load gold flow
const loadGoldFlow = async () => {
  loading.value = true
  try {
    const res = await getGoldDetail({
      userId: searchForm.userId,
      index: pagination.current,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    if (res.ec === 0) {
      flowList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0

      // Update summary
      if (res.data.summary) {
        summary.value = {
          currentBalance: res.data.summary.currentBalance || 0,
          totalIncome: res.data.summary.totalIncome || 0,
          totalExpense: res.data.summary.totalExpense || 0
        }
      }
    }
  } catch (error) {
    console.error('Load gold flow failed:', error)
  } finally {
    loading.value = false
  }
}

// Load data
const loadData = async () => {
  if (!searchForm.userId) {
    message.error('请输入用户ID')
    return
  }

  if (searchForm.flowType === 'diamond') {
    await loadDiamondFlow()
  } else {
    await loadGoldFlow()
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
  searchForm.flowType = 'diamond'
  dateRange.value = null
  pagination.current = 1
  flowList.value = []
  summary.value = null
}

// Handle export
const handleExport = async () => {
  if (!searchForm.userId) {
    message.error('请输入用户ID')
    return
  }

  exportLoading.value = true
  try {
    const res = await exportRecord({
      exportType: searchForm.flowType === 'diamond' ? 'DIAMOND' : 'GOLD',
      userId: searchForm.userId,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })

    // Create download link
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user_flow_${searchForm.userId}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('导出成功')
  } catch (error) {
    console.error('Export flow failed:', error)
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

// Handle view detail
const handleViewDetail = (record: any) => {
  currentFlow.value = record
  detailVisible.value = true
}

// Get change type color
const getChangeTypeColor = (type: string | number) => {
  const colorMap: Record<string, string> = {
    'RECHARGE': 'green',
    'GIFT': 'red',
    'WITHDRAW': 'orange',
    'SYSTEM': 'blue',
    'ADMIN': 'purple',
    'REFUND': 'cyan'
  }
  return colorMap[type] || 'default'
}
</script>

<style scoped lang="less">
.user-flow-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
