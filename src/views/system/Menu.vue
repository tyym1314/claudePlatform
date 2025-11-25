<template>
  <div class="menu-page">
    <a-card title="菜单管理" :bordered="false">
      <!-- Action Buttons -->
      <div class="action-bar">
        <a-button type="primary" @click="showAddModal(null)">新增一级菜单</a-button>
      </div>

      <!-- Data Table (Tree Structure) -->
      <a-table
        :columns="columns"
        :data-source="menuList"
        :loading="loading"
        :pagination="false"
        row-key="menuId"
        class="data-table"
        :defaultExpandAllRows="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'menuType'">
            <a-tag v-if="record.menuType === 1" color="blue">目录</a-tag>
            <a-tag v-else-if="record.menuType === 2" color="green">页面</a-tag>
            <a-tag v-else color="orange">按钮</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.menuType < 3"
                type="link"
                size="small"
                @click="showAddModal(record)"
              >
                新增子菜单
              </a-button>
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
        <a-form-item label="父级菜单">
          <a-input :value="parentMenuName" disabled />
        </a-form-item>
        <a-form-item label="菜单名称" required>
          <a-input v-model:value="formData.menuName" placeholder="请输入菜单名称" />
        </a-form-item>
        <a-form-item label="菜单类型" required>
          <a-radio-group v-model:value="formData.menuType">
            <a-radio :value="1">目录</a-radio>
            <a-radio :value="2">页面</a-radio>
            <a-radio :value="3">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="formData.menuType !== 3" label="菜单路径">
          <a-input v-model:value="formData.menuPath" placeholder="请输入菜单路径" />
        </a-form-item>
        <a-form-item v-if="formData.menuType === 3" label="权限标识">
          <a-input v-model:value="formData.perms" placeholder="请输入权限标识，如: system:user:add" />
        </a-form-item>
        <a-form-item label="菜单图标">
          <a-input v-model:value="formData.icon" placeholder="请输入图标名称" />
        </a-form-item>
        <a-form-item label="排序号">
          <a-input-number
            v-model:value="formData.orderNum"
            :min="0"
            placeholder="请输入排序号"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getMenuList, addMenu, updateMenu, deleteMenu } from '@/api/system'

const loading = ref(false)
const menuList = ref<any[]>([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const parentMenuName = ref('无（顶级菜单）')

const formData = reactive({
  menuId: undefined as number | undefined,
  menuName: '',
  menuPath: '',
  menuType: 1,
  perms: '',
  icon: '',
  orderNum: 0,
  parentId: 0
})

const modalTitle = computed(() => (isEdit.value ? '编辑菜单' : '新增菜单'))

const columns = [
  { title: '菜单名称', dataIndex: 'menuName', key: 'menuName', width: 200 },
  { title: '菜单类型', key: 'menuType', width: 100 },
  { title: '菜单路径', dataIndex: 'menuPath', key: 'menuPath' },
  { title: '权限标识', dataIndex: 'perms', key: 'perms' },
  { title: '图标', dataIndex: 'icon', key: 'icon', width: 100 },
  { title: '排序', dataIndex: 'orderNum', key: 'orderNum', width: 80 },
  { title: '操作', key: 'action', width: 250, fixed: 'right' }
]

onMounted(() => {
  fetchMenuList()
})

async function fetchMenuList() {
  try {
    loading.value = true
    const res = await getMenuList()
    menuList.value = buildMenuTree(res.list || [])
  } catch (error) {
    console.error('Fetch menu list error:', error)
  } finally {
    loading.value = false
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

function showAddModal(parent: any) {
  isEdit.value = false
  formData.menuId = undefined
  formData.menuName = ''
  formData.menuPath = ''
  formData.menuType = parent ? 2 : 1
  formData.perms = ''
  formData.icon = ''
  formData.orderNum = 0
  formData.parentId = parent ? parent.menuId : 0

  if (parent) {
    parentMenuName.value = parent.menuName
  } else {
    parentMenuName.value = '无（顶级菜单）'
  }

  modalVisible.value = true
}

function showEditModal(record: any) {
  isEdit.value = true
  formData.menuId = record.menuId
  formData.menuName = record.menuName
  formData.menuPath = record.menuPath
  formData.menuType = record.menuType
  formData.perms = record.perms
  formData.icon = record.icon
  formData.orderNum = record.orderNum
  formData.parentId = record.parentId

  parentMenuName.value = record.parentId === 0 ? '无（顶级菜单）' : '父级菜单'
  modalVisible.value = true
}

async function handleSubmit() {
  if (!formData.menuName) {
    message.error('请输入菜单名称')
    return
  }

  try {
    modalLoading.value = true
    if (isEdit.value) {
      await updateMenu(formData)
      message.success('更新成功')
    } else {
      await addMenu(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    fetchMenuList()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    modalLoading.value = false
  }
}

function handleDelete(record: any) {
  if (record.children && record.children.length > 0) {
    message.warning('请先删除子菜单')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除菜单 "${record.menuName}" 吗？`,
    onOk: async () => {
      try {
        await deleteMenu({ menuId: record.menuId })
        message.success('删除成功')
        fetchMenuList()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  })
}
</script>

<style scoped>
.menu-page {
  padding: 0;
}

.action-bar {
  margin-bottom: 16px;
}

.data-table {
  margin-top: 16px;
}
</style>
