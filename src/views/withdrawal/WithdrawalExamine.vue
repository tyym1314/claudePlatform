<template>
  <div class="withdrawal-examine-page">
    <!-- Summary Cards -->
    <a-row :gutter="16" class="summary-row">
      <a-col :span="12">
        <a-card>
          <a-statistic
            title="待审核总额(USD)"
            :value="summary.totalUsdAmount"
            :precision="2"
            prefix="$"
          />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card>
          <a-statistic
            title="待审核总额(金币)"
            :value="summary.totalGoldCoinAmount"
            :precision="0"
          />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="提现审核" :bordered="false" class="main-card">
      <!-- Search Form -->
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="用户ID">
          <a-input v-model:value="searchForm.userId" placeholder="用户ID" style="width: 150px" />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select v-model:value="searchForm.orderStatus" placeholder="请选择" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="PENDING">待审核</a-select-option>
            <a-select-option value="SUCCESS">成功</a-select-option>
            <a-select-option value="FAIL">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="国家">
          <a-select v-model:value="searchForm.country" placeholder="请选择" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="US">美国</a-select-option>
            <a-select-option value="CN">中国</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="渠道">
          <a-select v-model:value="searchForm.channel" placeholder="请选择" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="PayPal">PayPal</a-select-option>
            <a-select-option value="Stripe">Stripe</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- Action Buttons -->
      <div class="action-bar">
        <a-space>
          <a-button
            type="primary"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchApproval('PASS')"
          >
            批量通过
          </a-button>
          <a-button
            danger
            :disabled="!selectedRowKeys.length"
            @click="handleBatchApproval('REJECT')"
          >
            批量拒绝
          </a-button>
        </a-space>
      </div>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="withdrawalList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
        class="data-table"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
              <a-button
                v-if="record.status === 'PENDING'"
                type="link"
                size="small"
                @click="handleApproval(record, 'PASS')"
              >
                通过
              </a-button>
              <a-button
                v-if="record.status === 'PENDING'"
                type="link"
                danger
                size="small"
                @click="handleApproval(record, 'REJECT')"
              >
                拒绝
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="提现详情"
      width="900px"
      :footer="null"
    >
      <div v-if="currentRecord" class="withdrawal-detail">
        <a-descriptions title="订单信息" bordered :column="2">
          <a-descriptions-item label="平台订单号" :span="2">
            {{ currentRecord.platformOrderId }}
          </a-descriptions-item>
          <a-descriptions-item label="渠道订单号" :span="2">
            {{ currentRecord.channelOrderNo }}
          </a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusLabel(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ formatTime(currentRecord.createTime) }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-descriptions title="用户信息" bordered :column="2">
          <a-descriptions-item label="用户ID">{{ currentRecord.userId }}</a-descriptions-item>
          <a-descriptions-item label="用户状态">{{ currentRecord.userStatus }}</a-descriptions-item>
          <a-descriptions-item label="用户等级">{{ currentRecord.userLevel }}</a-descriptions-item>
          <a-descriptions-item label="账户余额">{{ currentRecord.accountBalance }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-descriptions title="提现信息" bordered :column="2">
          <a-descriptions-item label="提现金额">
            {{ currentRecord.withdrawAmount }} {{ currentRecord.withdrawCurrency }}
          </a-descriptions-item>
          <a-descriptions-item label="手续费">{{ currentRecord.fee }}</a-descriptions-item>
          <a-descriptions-item label="到账金额">
            {{ currentRecord.receivedAmount }}
          </a-descriptions-item>
          <a-descriptions-item label="提现渠道">{{ currentRecord.channel }}</a-descriptions-item>
          <a-descriptions-item label="国家/地区">
            {{ currentRecord.country }} / {{ currentRecord.region }}
          </a-descriptions-item>
          <a-descriptions-item label="账户类型">{{ currentRecord.accountType }}</a-descriptions-item>
        </a-descriptions>

        <div v-if="currentRecord.status === 'PENDING'" class="approval-actions">
          <a-divider />
          <a-form :model="approvalForm" layout="vertical">
            <a-form-item label="审核备注">
              <a-textarea
                v-model:value="approvalForm.remark"
                placeholder="请输入审核备注(可选)"
                :rows="3"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleDetailApproval('PASS')">审核通过</a-button>
                <a-button danger @click="handleDetailApproval('REJECT')">审核拒绝</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getWithdrawalList, getWithdrawalSummary, approval } from '@/api/withdrawal'
import type { WithdrawalOrder, WithdrawalListQuery } from '@/types/withdrawal'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const withdrawalList = ref<WithdrawalOrder[]>([])
const detailVisible = ref(false)
const currentRecord = ref<WithdrawalOrder | null>(null)
const selectedRowKeys = ref<number[]>([])

const summary = ref({
  totalUsdAmount: 0,
  totalGoldCoinAmount: 0
})

const searchForm = reactive<WithdrawalListQuery>({
  pageNo: 1,
  pageSize: 10,
  orderStatus: 'PENDING'
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const approvalForm = reactive({
  remark: ''
})

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys
  }
}

const columns = [
  { title: '订单号', dataIndex: 'platformOrderId', key: 'orderId', width: 180, fixed: 'left' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '金额', dataIndex: 'withdrawAmount', key: 'amount', width: 100 },
  { title: '渠道', dataIndex: 'channel', key: 'channel', width: 100 },
  { title: '国家', dataIndex: 'country', key: 'country', width: 80 },
  { title: '状态', key: 'status', width: 100 },
  { title: '申请时间', key: 'createTime', width: 160, customRender: ({ record }: any) => formatTime(record.createTime) },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

onMounted(() => {
  fetchWithdrawalList()
  fetchSummary()
})

async function fetchWithdrawalList() {
  try {
    loading.value = true
    const res = await getWithdrawalList(searchForm)
    withdrawalList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch withdrawal list error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const res = await getWithdrawalSummary({ orderStatus: 'PENDING' })
    summary.value = res
  } catch (error) {
    console.error('Fetch summary error:', error)
  }
}

function handleSearch() {
  searchForm.pageNo = 1
  pagination.current = 1
  fetchWithdrawalList()
}

function handleReset() {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 10,
    userId: undefined,
    orderStatus: 'PENDING',
    channel: undefined,
    country: undefined
  })
  pagination.current = 1
  fetchWithdrawalList()
}

function handleTableChange(pag: any) {
  searchForm.pageNo = pag.current
  searchForm.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchWithdrawalList()
}

function showDetail(record: WithdrawalOrder) {
  currentRecord.value = record
  approvalForm.remark = ''
  detailVisible.value = true
}

async function handleApproval(record: WithdrawalOrder, status: string) {
  Modal.confirm({
    title: '确认操作',
    content: `确定要${status === 'PASS' ? '通过' : '拒绝'}此提现申请吗?`,
    onOk: async () => {
      await submitApproval([record.id], status)
    }
  })
}

async function handleBatchApproval(status: string) {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要操作的订单')
    return
  }

  Modal.confirm({
    title: '确认批量操作',
    content: `确定要${status === 'PASS' ? '通过' : '拒绝'} ${selectedRowKeys.value.length} 笔提现申请吗?`,
    onOk: async () => {
      await submitApproval(selectedRowKeys.value, status)
    }
  })
}

async function handleDetailApproval(status: string) {
  if (!currentRecord.value) return
  await submitApproval([currentRecord.value.id], status, approvalForm.remark)
  detailVisible.value = false
}

async function submitApproval(ids: number[], status: string, remark?: string) {
  try {
    await approval({
      ids,
      operatorId: userStore.userInfo?.username || 'admin',
      operatorName: userStore.userInfo?.realName || '管理员',
      status,
      remark
    })
    message.success('操作成功')
    selectedRowKeys.value = []
    fetchWithdrawalList()
    fetchSummary()
  } catch (error) {
    console.error('Approval error:', error)
  }
}

function handleExport() {
  message.info('导出功能')
}

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    CREATED: 'default',
    PENDING: 'processing',
    SUCCESS: 'success',
    FAIL: 'error'
  }
  return colorMap[status] || 'default'
}

function getStatusLabel(status: string) {
  const labelMap: Record<string, string> = {
    CREATED: '已创建',
    PENDING: '待审核',
    SUCCESS: '成功',
    FAIL: '失败'
  }
  return labelMap[status] || status
}

function formatTime(timestamp: number) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.withdrawal-examine-page {
  padding: 0;
}

.summary-row {
  margin-bottom: 16px;
}

.main-card {
  margin-top: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
}

.data-table {
  margin-top: 16px;
}

.withdrawal-detail {
  padding: 16px 0;
}

.approval-actions {
  margin-top: 16px;
}
</style>
