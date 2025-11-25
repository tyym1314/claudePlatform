<template>
  <div class="sys-user-page">
    <a-card title="系统用户管理" :bordered="false">
      <!-- Search Form -->
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入用户名"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- Action Buttons -->
      <div class="action-bar">
        <a-button type="primary" @click="showAddModal">新增用户</a-button>
      </div>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="userId"
        class="data-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'roles'">
            <a-tag v-for="role in record.roles" :key="role.roleId" color="blue">
              {{ role.roleName }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ formatTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      :confirmLoading="modalLoading"
      width="600px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名" required>
          <a-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item v-if="!isEdit" label="密码" required>
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="真实姓名" required>
          <a-input v-model:value="formData.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select
            v-model:value="formData.roleIds"
            mode="multiple"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <a-select-option v-for="role in allRoles" :key="role.roleId" :value="role.roleId">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getUserPage, addUser, updateUser, deleteUser } from '@/api/system'
import { getAllRoles } from '@/api/system'
import type { UserInfo } from '@/types/user'

const loading = ref(false)
const userList = ref<UserInfo[]>([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const allRoles = ref<any[]>([])

const searchForm = reactive({
  pageNo: 1,
  pageSize: 10,
  username: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const formData = reactive({
  userId: undefined as number | undefined,
  username: '',
  password: '',
  realName: '',
  roleIds: [] as number[],
  status: 1
})

const modalTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

const columns = [
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
  { title: '角色', key: 'roles', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

onMounted(() => {
  fetchUserList()
  fetchAllRoles()
})

async function fetchUserList() {
  try {
    loading.value = true
    const res = await getUserPage(searchForm)
    userList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch user list error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchAllRoles() {
  try {
    const res = await getAllRoles()
    allRoles.value = res.list || []
  } catch (error) {
    console.error('Fetch roles error:', error)
  }
}

function handleSearch() {
  searchForm.pageNo = 1
  pagination.current = 1
  fetchUserList()
}

function handleReset() {
  searchForm.username = ''
  searchForm.pageNo = 1
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

function showAddModal() {
  isEdit.value = false
  formData.userId = undefined
  formData.username = ''
  formData.password = ''
  formData.realName = ''
  formData.roleIds = []
  formData.status = 1
  modalVisible.value = true
}

function showEditModal(record: UserInfo) {
  isEdit.value = true
  formData.userId = record.userId
  formData.username = record.username
  formData.password = ''
  formData.realName = record.realName
  formData.roleIds = record.roleIds || []
  formData.status = record.status
  modalVisible.value = true
}

async function handleSubmit() {
  // Validate
  if (!formData.username) {
    message.error('请输入用户名')
    return
  }
  if (!isEdit.value && !formData.password) {
    message.error('请输入密码')
    return
  }
  if (!formData.realName) {
    message.error('请输入真实姓名')
    return
  }
  if (!formData.roleIds.length) {
    message.error('请选择角色')
    return
  }

  try {
    modalLoading.value = true
    if (isEdit.value) {
      await updateUser(formData)
      message.success('更新成功')
    } else {
      await addUser(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    modalLoading.value = false
  }
}

function handleDelete(record: UserInfo) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.username}" 吗？`,
    onOk: async () => {
      try {
        await deleteUser({ userId: record.userId })
        message.success('删除成功')
        fetchUserList()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  })
}

function formatTime(timestamp: number) {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<style scoped>
.sys-user-page {
  padding: 0;
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
</style>
