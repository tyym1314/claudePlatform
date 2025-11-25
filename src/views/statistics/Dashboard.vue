<template>
  <div class="dashboard-container">
    <!-- Date Range Selector -->
    <a-card :bordered="false" style="margin-bottom: 20px">
      <a-space>
        <a-range-picker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <a-button @click="handleRefresh" :loading="loading">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </a-space>
    </a-card>

    <!-- Overview Statistics Cards -->
    <a-row :gutter="16" style="margin-bottom: 20px">
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic
            title="总用户数"
            :value="overviewData.totalUsers"
            :value-style="{ color: '#3f8600' }"
          >
            <template #suffix>
              <UserOutlined />
            </template>
          </a-statistic>
          <div class="trend-info">
            <span :class="{ 'trend-up': overviewData.userTrend > 0, 'trend-down': overviewData.userTrend < 0 }">
              {{ overviewData.userTrend > 0 ? '↑' : '↓' }} {{ Math.abs(overviewData.userTrend) }}%
            </span>
            <span style="margin-left: 8px; color: #999">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic
            title="活跃用户"
            :value="overviewData.activeUsers"
            :value-style="{ color: '#1890ff' }"
          >
            <template #suffix>
              <TeamOutlined />
            </template>
          </a-statistic>
          <div class="trend-info">
            <span :class="{ 'trend-up': overviewData.activeTrend > 0, 'trend-down': overviewData.activeTrend < 0 }">
              {{ overviewData.activeTrend > 0 ? '↑' : '↓' }} {{ Math.abs(overviewData.activeTrend) }}%
            </span>
            <span style="margin-left: 8px; color: #999">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic
            title="今日收益"
            :value="overviewData.todayRevenue / 100"
            :precision="2"
            prefix="$"
            :value-style="{ color: '#cf1322' }"
          >
            <template #suffix>
              <DollarOutlined />
            </template>
          </a-statistic>
          <div class="trend-info">
            <span :class="{ 'trend-up': overviewData.revenueTrend > 0, 'trend-down': overviewData.revenueTrend < 0 }">
              {{ overviewData.revenueTrend > 0 ? '↑' : '↓' }} {{ Math.abs(overviewData.revenueTrend) }}%
            </span>
            <span style="margin-left: 8px; color: #999">较昨日</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic
            title="在线房间"
            :value="overviewData.onlineRooms"
            :value-style="{ color: '#faad14' }"
          >
            <template #suffix>
              <HomeOutlined />
            </template>
          </a-statistic>
          <div class="trend-info">
            <span style="color: #999">在线主播: {{ overviewData.onlineAnchors }}</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Row 1 -->
    <a-row :gutter="16" style="margin-bottom: 20px">
      <a-col :span="12">
        <a-card title="用户增长趋势" :bordered="false" :loading="loading">
          <div ref="userChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="收益趋势" :bordered="false" :loading="loading">
          <div ref="revenueChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Row 2 -->
    <a-row :gutter="16" style="margin-bottom: 20px">
      <a-col :span="12">
        <a-card title="热门礼物Top10" :bordered="false" :loading="loading">
          <div ref="giftChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="用户留存率" :bordered="false" :loading="loading">
          <a-table
            :columns="retentionColumns"
            :data-source="retentionData"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'retention'">
                <a-progress
                  :percent="record.retention"
                  :status="record.retention > 50 ? 'success' : 'normal'"
                />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- Real-time Statistics -->
    <a-card title="实时数据" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-statistic title="在线用户" :value="realTimeData.onlineUsers" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="直播房间" :value="realTimeData.liveRooms" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="今日新增" :value="realTimeData.todayNewUsers" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="今日充值" :value="realTimeData.todayRecharge / 100" prefix="$" :precision="2" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="今日消费" :value="realTimeData.todayConsume / 100" prefix="$" :precision="2" />
        </a-col>
        <a-col :span="4">
          <a-statistic title="今日提现" :value="realTimeData.todayWithdraw / 100" prefix="$" :precision="2" />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ReloadOutlined, UserOutlined, TeamOutlined, DollarOutlined, HomeOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import * as echarts from 'echarts'
import {
  getOverviewStatistics,
  getUserStatistics,
  getRevenueStatistics,
  getGiftStatistics,
  getRetentionStatistics,
  getRealTimeStatistics
} from '@/api/statistics'

// Date range
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(7, 'day'),
  dayjs()
])

// Loading state
const loading = ref(false)

// Overview data
const overviewData = reactive({
  totalUsers: 0,
  activeUsers: 0,
  todayRevenue: 0,
  onlineRooms: 0,
  onlineAnchors: 0,
  userTrend: 0,
  activeTrend: 0,
  revenueTrend: 0
})

// Real-time data
const realTimeData = reactive({
  onlineUsers: 0,
  liveRooms: 0,
  todayNewUsers: 0,
  todayRecharge: 0,
  todayConsume: 0,
  todayWithdraw: 0
})

// Retention data
const retentionColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '新增用户', dataIndex: 'newUsers', key: 'newUsers' },
  { title: '次日留存', key: 'retention' }
]
const retentionData = ref<any[]>([])

// Chart refs
const userChartRef = ref()
const revenueChartRef = ref()
const giftChartRef = ref()

// Chart instances
let userChart: any = null
let revenueChart: any = null
let giftChart: any = null

// Real-time update timer
let realTimeTimer: any = null

// Load overview statistics
const loadOverviewStatistics = async () => {
  try {
    const res = await getOverviewStatistics({
      startTime: dateRange.value ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endTime: dateRange.value ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined
    })
    if (res.ec === 0 && res.data) {
      Object.assign(overviewData, res.data)
    }
  } catch (error) {
    console.error('Load overview statistics failed:', error)
  }
}

// Load user statistics and draw chart
const loadUserStatistics = async () => {
  try {
    const res = await getUserStatistics({
      startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
      endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    })
    if (res.ec === 0 && res.data) {
      drawUserChart(res.data)
    }
  } catch (error) {
    console.error('Load user statistics failed:', error)
  }
}

// Load revenue statistics and draw chart
const loadRevenueStatistics = async () => {
  try {
    const res = await getRevenueStatistics({
      startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
      endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    })
    if (res.ec === 0 && res.data) {
      drawRevenueChart(res.data)
    }
  } catch (error) {
    console.error('Load revenue statistics failed:', error)
  }
}

// Load gift statistics and draw chart
const loadGiftStatistics = async () => {
  try {
    const res = await getGiftStatistics({
      startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
      endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD'),
      topN: 10
    })
    if (res.ec === 0 && res.data) {
      drawGiftChart(res.data)
    }
  } catch (error) {
    console.error('Load gift statistics failed:', error)
  }
}

// Load retention statistics
const loadRetentionStatistics = async () => {
  try {
    const res = await getRetentionStatistics({
      startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      days: 7
    })
    if (res.ec === 0 && res.data) {
      retentionData.value = res.data
    }
  } catch (error) {
    console.error('Load retention statistics failed:', error)
  }
}

// Load real-time statistics
const loadRealTimeStatistics = async () => {
  try {
    const res = await getRealTimeStatistics()
    if (res.ec === 0 && res.data) {
      Object.assign(realTimeData, res.data)
    }
  } catch (error) {
    console.error('Load real-time statistics failed:', error)
  }
}

// Draw user chart
const drawUserChart = (data: any) => {
  if (!userChart) {
    userChart = echarts.init(userChartRef.value)
  }
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增用户', '活跃用户'] },
    xAxis: { type: 'category', data: data.dates || [] },
    yAxis: { type: 'value' },
    series: [
      { name: '新增用户', type: 'line', data: data.newUsers || [], smooth: true },
      { name: '活跃用户', type: 'line', data: data.activeUsers || [], smooth: true }
    ]
  }
  userChart.setOption(option)
}

// Draw revenue chart
const drawRevenueChart = (data: any) => {
  if (!revenueChart) {
    revenueChart = echarts.init(revenueChartRef.value)
  }
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['充值', '消费'] },
    xAxis: { type: 'category', data: data.dates || [] },
    yAxis: { type: 'value' },
    series: [
      { name: '充值', type: 'bar', data: data.recharge || [] },
      { name: '消费', type: 'bar', data: data.consume || [] }
    ]
  }
  revenueChart.setOption(option)
}

// Draw gift chart
const drawGiftChart = (data: any) => {
  if (!giftChart) {
    giftChart = echarts.init(giftChartRef.value)
  }
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.giftNames || [] },
    series: [
      { name: '送出次数', type: 'bar', data: data.giftCounts || [] }
    ]
  }
  giftChart.setOption(option)
}

// Handle date change
const handleDateChange = () => {
  loadAllData()
}

// Handle refresh
const handleRefresh = () => {
  loadAllData()
}

// Load all data
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadOverviewStatistics(),
      loadUserStatistics(),
      loadRevenueStatistics(),
      loadGiftStatistics(),
      loadRetentionStatistics()
    ])
  } finally {
    loading.value = false
  }
}

// Start real-time update
const startRealTimeUpdate = () => {
  loadRealTimeStatistics()
  realTimeTimer = setInterval(() => {
    loadRealTimeStatistics()
  }, 30000) // Update every 30 seconds
}

// Stop real-time update
const stopRealTimeUpdate = () => {
  if (realTimeTimer) {
    clearInterval(realTimeTimer)
    realTimeTimer = null
  }
}

onMounted(() => {
  loadAllData()
  startRealTimeUpdate()
})

onBeforeUnmount(() => {
  stopRealTimeUpdate()
  if (userChart) userChart.dispose()
  if (revenueChart) revenueChart.dispose()
  if (giftChart) giftChart.dispose()
})
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 20px;
}

.trend-info {
  margin-top: 8px;
  font-size: 14px;

  .trend-up {
    color: #3f8600;
  }

  .trend-down {
    color: #cf1322;
  }
}
</style>
