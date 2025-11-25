<template>
  <div class="role-page">
    <a-card title="角色管理" :bordered="false">
      <!-- Search Form -->
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="角色名称">
          <a-input
            v-model:value="searchForm.roleName"
            placeholder="请输入角色名称"
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
        <a-button type="primary" @click="showAddModal">新增角色</a-button>
      </div>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="roleList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="roleId"
        class="data-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'createTime'">
            {{ formatTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
              <a-button type="link" size="small" @click="showPermissionModal(record)">
                配置权限
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
        <a-form-item label="角色名称" required>
          <a-input v-model:value="formData.roleName" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model:value="formData.roleDesc" placeholder="请输入角色描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Permission Modal -->
    <a-modal
      v-model:open="permissionModalVisible"
      title="配置权限"
      @ok="handlePermissionSubmit"
      :confirmLoading="permissionLoading"
      width="600px"
    >
      <a-tree
        v-model:checkedKeys="checkedKeys"
        checkable
        :tree-data="menuTree"
        :field-names="{ title: 'menuName', key: 'menuId', children: 'children' }"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getRolePage, addRole, updateRole, getRoleInfo } from '@/api/system'
import { getMenuList } from '@/api/system'

const loading = ref(false)
const roleList = ref<any[]>([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const permissionModalVisible = ref(false)
const permissionLoading = ref(false)
const currentRoleId = ref<number>()
const menuTree = ref<any[]>([])
const checkedKeys = ref<number[]>([])

const searchForm = reactive({
  pageNo: 1,
  pageSize: 10,
  roleName: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const formData = reactive({
  roleId: undefined as number | undefined,
  roleName: '',
  roleDesc: ''
})

const modalTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

const columns = [
  { title: '角色ID', dataIndex: 'roleId', key: 'roleId', width: 100 },
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '角色描述', dataIndex: 'roleDesc', key: 'roleDesc' },
  { title: '创建时间', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

onMounted(() => {
  fetchRoleList()
  fetchMenuList()
})

async function fetchRoleList() {
  try {
    loading.value = true
    const res = await getRolePage(searchForm)
    roleList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch role list error:', error)
  } finally {
    loading.value = false
  }
}

async function fetchMenuList() {
  try {
    const res = await getMenuList()
    menuTree.value = buildMenuTree(res.list || [])
  } catch (error) {
    console.error('Fetch menu list error:', error)
  }
}

function buildMenuTree(menus: any[]) {
  const map: any = {}
  const roots: any[] = []

  menus.forEach(menu => {
    map[menu.menuId] = { ...menu, children: [] }
  })

  menus.forEach(menu => {
    if (menu.parentId === 0) {
      roots.push(map[menu.menuId])
    } else if (map[menu.parentId]) {
      map[menu.parentId].children.push(map[menu.menuId])
    }
  })

  return roots
}

function handleSearch() {
  searchForm.pageNo = 1
  pagination.current = 1
  fetchRoleList()
}

function handleReset() {
  searchForm.roleName = ''
  searchForm.pageNo = 1
  pagination.current = 1
  fetchRoleList()
}

function handleTableChange(pag: any) {
  searchForm.pageNo = pag.current
  searchForm.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchRoleList()
}

function showAddModal() {
  isEdit.value = false
  formData.roleId = undefined
  formData.roleName = ''
  formData.roleDesc = ''
  modalVisible.value = true
}

function showEditModal(record: any) {
  isEdit.value = true
  formData.roleId = record.roleId
  formData.roleName = record.roleName
  formData.roleDesc = record.roleDesc
  modalVisible.value = true
}

async function showPermissionModal(record: any) {
  currentRoleId.value = record.roleId
  try {
    const res = await getRoleInfo({ roleId: record.roleId })
    checkedKeys.value = res.menuIds || []
    permissionModalVisible.value = true
  } catch (error) {
    console.error('Get role info error:', error)
  }
}

async function handleSubmit() {
  if (!formData.roleName) {
    message.error('请输入角色名称')
    return
  }

  try {
    modalLoading.value = true
    if (isEdit.value) {
      await updateRole(formData)
      message.success('更新成功')
    } else {
      await addRole(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    fetchRoleList()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    modalLoading.value = false
  }
}

async function handlePermissionSubmit() {
  try {
    permissionLoading.value = true
    await updateRole({
      roleId: currentRoleId.value,
      menuIds: checkedKeys.value
    })
    message.success('权限配置成功')
    permissionModalVisible.value = false
  } catch (error) {
    console.error('Permission submit error:', error)
  } finally {
    permissionLoading.value = false
  }
}

function formatTime(timestamp: number) {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<style scoped>
.role-page {
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
