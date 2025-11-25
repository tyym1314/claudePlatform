<template>
  <div class="room-statistics-container">
    <a-card title="房间数据统计" :bordered="false">
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
          <a-form-item label="统计时间">
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              style="width: 250px"
            />
          </a-form-item>
          <a-form-item label="排序">
            <a-select
              v-model:value="searchForm.sortBy"
              placeholder="请选择排序字段"
              style="width: 120px"
            >
              <a-select-option value="income">收益</a-select-option>
              <a-select-option value="duration">时长</a-select-option>
              <a-select-option value="audience">观众数</a-select-option>
            </a-select>
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

      <!-- Statistics Table -->
      <a-table
        :columns="columns"
        :data-source="statisticsList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="roomId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'totalIncome'">
            ${{ (record.totalIncome / 100).toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'totalDuration'">
            {{ formatDuration(record.totalDuration) }}
          </template>
          <template v-else-if="column.key === 'avgAudience'">
            {{ record.avgAudience || 0 }}
          </template>
          <template v-else-if="column.key === 'peakAudience'">
            {{ record.peakAudience || 0 }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              查看详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Ranking Cards -->
    <a-row :gutter="16" style="margin-top: 20px">
      <a-col :span="12">
        <a-card title="收益排行榜" :bordered="false">
          <a-list
            :data-source="incomeRanking"
            :loading="rankingLoading"
            size="small"
          >
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-badge
                      :count="index + 1"
                      :number-style="{
                        backgroundColor: index < 3 ? '#faad14' : '#d9d9d9'
                      }"
                    />
                  </template>
                  <template #title>
                    {{ item.roomName }} (ID: {{ item.roomId }})
                  </template>
                  <template #description>
                    主播: {{ item.userName }} (ID: {{ item.userId }})
                  </template>
                </a-list-item-meta>
                <div>${{ (item.totalIncome / 100).toFixed(2) }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="时长排行榜" :bordered="false">
          <a-list
            :data-source="durationRanking"
            :loading="rankingLoading"
            size="small"
          >
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-badge
                      :count="index + 1"
                      :number-style="{
                        backgroundColor: index < 3 ? '#52c41a' : '#d9d9d9'
                      }"
                    />
                  </template>
                  <template #title>
                    {{ item.roomName }} (ID: {{ item.roomId }})
                  </template>
                  <template #description>
                    主播: {{ item.userName }} (ID: {{ item.userId }})
                  </template>
                </a-list-item-meta>
                <div>{{ formatDuration(item.totalDuration) }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="房间统计详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentStatistics">
        <a-descriptions-item label="房间ID">{{ currentStatistics.roomId }}</a-descriptions-item>
        <a-descriptions-item label="房间名称">{{ currentStatistics.roomName }}</a-descriptions-item>
        <a-descriptions-item label="主播ID">{{ currentStatistics.userId }}</a-descriptions-item>
        <a-descriptions-item label="主播昵称">{{ currentStatistics.userName }}</a-descriptions-item>
        <a-descriptions-item label="统计日期">{{ currentStatistics.date }}</a-descriptions-item>
        <a-descriptions-item label="直播时长">
          {{ formatDuration(currentStatistics.totalDuration) }}
        </a-descriptions-item>
        <a-descriptions-item label="总收益">
          ${{ (currentStatistics.totalIncome / 100).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="礼物收益">
          ${{ (currentStatistics.giftIncome / 100).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="平均观众">{{ currentStatistics.avgAudience }}</a-descriptions-item>
        <a-descriptions-item label="峰值观众">{{ currentStatistics.peakAudience }}</a-descriptions-item>
        <a-descriptions-item label="新增关注">{{ currentStatistics.newFollowers }}</a-descriptions-item>
        <a-descriptions-item label="弹幕数">{{ currentStatistics.commentCount }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getRoomStatistics,
  getRoomStatisticsDetail,
  exportRoomStatistics,
  getRoomIncomeRanking,
  getRoomDurationRanking
} from '@/api/room'

// Table columns
const columns = [
  { title: '房间ID', dataIndex: 'roomId', key: 'roomId', width: 100 },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName' },
  { title: '主播ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '主播昵称', dataIndex: 'userName', key: 'userName' },
  { title: '总收益', key: 'totalIncome', width: 120, sorter: true },
  { title: '直播时长', key: 'totalDuration', width: 120, sorter: true },
  { title: '平均观众', key: 'avgAudience', width: 100, sorter: true },
  { title: '峰值观众', key: 'peakAudience', width: 100, sorter: true },
  { title: '操作', key: 'action', width: 120 }
]

// Search form
const searchForm = reactive<any>({
  roomId: undefined,
  userId: undefined,
  sortBy: 'income',
  sortOrder: 'desc'
})

// Date range
const dateRange = ref<[Dayjs, Dayjs] | null>([
  dayjs().subtract(7, 'day'),
  dayjs()
])

// State
const loading = ref(false)
const exportLoading = ref(false)
const rankingLoading = ref(false)
const statisticsList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Ranking lists
const incomeRanking = ref<any[]>([])
const durationRanking = ref<any[]>([])

// Detail modal
const detailVisible = ref(false)
const currentStatistics = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoomStatistics({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      roomId: searchForm.roomId,
      userId: searchForm.userId,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined,
      sortBy: searchForm.sortBy,
      sortOrder: searchForm.sortOrder
    })
    if (res.ec === 0) {
      statisticsList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load room statistics failed:', error)
  } finally {
    loading.value = false
  }
}

// Load ranking lists
const loadRankings = async () => {
  if (!dateRange.value) return

  rankingLoading.value = true
  try {
    const startTime = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
    const endTime = dayjs(dateRange.value[1]).format('YYYY-MM-DD')

    const [incomeRes, durationRes] = await Promise.all([
      getRoomIncomeRanking({ startTime, endTime, limit: 10 }),
      getRoomDurationRanking({ startTime, endTime, limit: 10 })
    ])

    if (incomeRes.ec === 0) {
      incomeRanking.value = incomeRes.data || []
    }
    if (durationRes.ec === 0) {
      durationRanking.value = durationRes.data || []
    }
  } catch (error) {
    console.error('Load rankings failed:', error)
  } finally {
    rankingLoading.value = false
  }
}

// Handle search
const handleSearch = () => {
  pagination.current = 1
  loadData()
  loadRankings()
}

// Handle reset
const handleReset = () => {
  searchForm.roomId = undefined
  searchForm.userId = undefined
  searchForm.sortBy = 'income'
  searchForm.sortOrder = 'desc'
  dateRange.value = [dayjs().subtract(7, 'day'), dayjs()]
  pagination.current = 1
  loadData()
  loadRankings()
}

// Handle export
const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportRoomStatistics({
      roomId: searchForm.roomId,
      userId: searchForm.userId,
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })

    // Create download link
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `room_statistics_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('导出成功')
  } catch (error) {
    console.error('Export room statistics failed:', error)
  } finally {
    exportLoading.value = false
  }
}

// Handle table change
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize

  if (sorter.field) {
    searchForm.sortBy = sorter.field === 'totalIncome' ? 'income'
      : sorter.field === 'totalDuration' ? 'duration'
      : sorter.field === 'avgAudience' ? 'audience' : 'income'
    searchForm.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
  }

  loadData()
}

// Handle view detail
const handleViewDetail = async (record: any) => {
  try {
    const res = await getRoomStatisticsDetail({
      roomId: record.roomId,
      date: record.date || dayjs().format('YYYY-MM-DD')
    })
    if (res.ec === 0 && res.data) {
      currentStatistics.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('Get room statistics detail failed:', error)
  }
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
loadRankings()
</script>

<style scoped lang="less">
.room-statistics-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
