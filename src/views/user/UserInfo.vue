<template>
  <div class="user-info-page">
    <a-card title="用户信息管理" :bordered="false">
      <!-- Search Form -->
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="用户ID">
          <a-input v-model:value="searchForm.userId" placeholder="请输入用户ID" style="width: 200px" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="searchForm.mobile" placeholder="请输入手机号" style="width: 200px" />
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="searchForm.gender" placeholder="请选择" style="width: 120px">
            <a-select-option :value="undefined">全部</a-select-option>
            <a-select-option :value="0">未知</a-select-option>
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择" style="width: 120px">
            <a-select-option :value="undefined">全部</a-select-option>
            <a-select-option :value="1">普通用户</a-select-option>
            <a-select-option :value="2">主播</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        class="data-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="showUserDetail(record)">查看详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- User Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="用户详情"
      :footer="null"
      width="800px"
    >
      <div v-if="currentUser" class="user-detail">
        <a-descriptions title="基本信息" bordered :column="2">
          <a-descriptions-item label="用户ID">{{ currentUser.id }}</a-descriptions-item>
          <a-descriptions-item label="昵称">{{ currentUser.nickname }}</a-descriptions-item>
          <a-descriptions-item label="性别">{{ currentUser.genderLabel }}</a-descriptions-item>
          <a-descriptions-item label="手机号">{{ currentUser.mobile }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ currentUser.email || '-' }}</a-descriptions-item>
          <a-descriptions-item label="国家">{{ currentUser.homeCountry }}</a-descriptions-item>
          <a-descriptions-item label="城市">{{ currentUser.homeCity || '-' }}</a-descriptions-item>
          <a-descriptions-item label="注册IP">{{ currentUser.registerIp }}</a-descriptions-item>
          <a-descriptions-item label="用户状态">
            <a-tag :color="currentUser.status === 0 ? 'success' : 'error'">
              {{ currentUser.statusLabel }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用户类型">{{ currentUser.typeLabel }}</a-descriptions-item>
          <a-descriptions-item label="余额">{{ currentUser.balanceAmount }}钻石</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ currentUser.createTimeLabel }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <div class="action-buttons">
          <a-space>
            <a-button type="primary" @click="showDiamondsModal">下发钻石</a-button>
            <a-button @click="showFlowModal('diamond')">查看钻石流水</a-button>
            <a-button @click="showFlowModal('gold')">查看金币流水</a-button>
            <a-button danger @click="handleBanUser">封禁用户</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- Update Diamonds Modal -->
    <a-modal
      v-model:open="diamondsModalVisible"
      title="下发钻石"
      @ok="handleUpdateDiamonds"
      :confirmLoading="diamondsLoading"
    >
      <a-form :model="diamondsForm" layout="vertical">
        <a-form-item label="用户ID">
          <a-input :value="currentUser?.id" disabled />
        </a-form-item>
        <a-form-item label="当前余额">
          <a-input :value="currentUser?.balanceAmount + ' 钻石'" disabled />
        </a-form-item>
        <a-form-item label="下发数量" required>
          <a-input-number
            v-model:value="diamondsForm.amount"
            :min="-999999"
            :max="999999"
            placeholder="正数增加,负数减少"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="操作原因" required>
          <a-textarea
            v-model:value="diamondsForm.remark"
            placeholder="请输入操作原因"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="来源">
          <a-select v-model:value="diamondsForm.source">
            <a-select-option value="activity">活动奖励</a-select-option>
            <a-select-option value="compensation">补偿</a-select-option>
            <a-select-option value="manual">手动调整</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUserList, updateDiamonds } from '@/api/user'
import type { AppUser, UserListQuery } from '@/types/app-user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const userList = ref<AppUser[]>([])
const detailVisible = ref(false)
const currentUser = ref<AppUser | null>(null)
const diamondsModalVisible = ref(false)
const diamondsLoading = ref(false)

const searchForm = reactive<UserListQuery>({
  pageNo: 1,
  pageSize: 10
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const diamondsForm = reactive({
  amount: 0,
  remark: '',
  source: 'activity'
})

const columns = [
  { title: '用户ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '性别', dataIndex: 'genderLabel', key: 'gender', width: 80 },
  { title: '手机号', dataIndex: 'mobile', key: 'mobile', width: 130 },
  { title: '余额', dataIndex: 'balanceAmount', key: 'balance', width: 100 },
  { title: '状态', dataIndex: 'statusLabel', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

onMounted(() => {
  fetchUserList()
})

async function fetchUserList() {
  try {
    loading.value = true
    const res = await getUserList(searchForm)
    userList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch user list error:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  searchForm.pageNo = 1
  pagination.current = 1
  fetchUserList()
}

function handleReset() {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 10,
    userId: undefined,
    mobile: undefined,
    gender: undefined,
    type: undefined
  })
  pagination.current = 1
  fetchUserList()
}

function handleTableChange(pag: any) {
  searchForm.pageNo = pag.current
  searchForm.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchUserList()
}

function showUserDetail(user: AppUser) {
  currentUser.value = user
  detailVisible.value = true
}

function showDiamondsModal() {
  diamondsForm.amount = 0
  diamondsForm.remark = ''
  diamondsForm.source = 'activity'
  diamondsModalVisible.value = true
}

async function handleUpdateDiamonds() {
  if (!currentUser.value) return
  if (!diamondsForm.amount) {
    message.error('请输入下发数量')
    return
  }
  if (!diamondsForm.remark) {
    message.error('请输入操作原因')
    return
  }

  try {
    diamondsLoading.value = true
    await updateDiamonds({
      userId: String(currentUser.value.id),
      operator: userStore.userInfo?.username || 'admin',
      remark: diamondsForm.remark,
      source: diamondsForm.source,
      customerAmount: diamondsForm.amount
    })
    message.success('操作成功')
    diamondsModalVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('Update diamonds error:', error)
  } finally {
    diamondsLoading.value = false
  }
}

function showFlowModal(type: 'diamond' | 'gold') {
  message.info(`查看${type === 'diamond' ? '钻石' : '金币'}流水功能`)
}

function handleBanUser() {
  message.warning('封禁用户功能')
}
</script>

<style scoped>
.user-info-page {
  padding: 0;
}

.search-form {
  margin-bottom: 16px;
}

.data-table {
  margin-top: 16px;
}

.user-detail {
  padding: 16px 0;
}

.action-buttons {
  margin-top: 16px;
}
</style>
