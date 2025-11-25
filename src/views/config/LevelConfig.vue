<template>
  <div class="level-config-container">
    <a-card title="等级配置" :bordered="false">
      <!-- Action Bar -->
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          添加等级
        </a-button>
      </div>

      <!-- Level Table -->
      <a-table
        :columns="columns"
        :data-source="levelList"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'levelDisplay'">
            <a-space>
              <span v-if="record.icon" style="font-size: 24px">{{ record.icon }}</span>
              <span style="font-weight: bold">LV{{ record.level }}</span>
              <span>{{ record.levelName }}</span>
            </a-space>
          </template>
          <template v-else-if="column.key === 'expRange'">
            {{ record.minExp }} - {{ record.maxExp === -1 ? '∞' : record.maxExp }}
          </template>
          <template v-else-if="column.key === 'privileges'">
            <a-tag
              v-for="(privilege, idx) in record.privileges"
              :key="idx"
              color="blue"
              style="margin-bottom: 4px"
            >
              {{ privilege }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除该等级配置吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="等级" required>
          <a-input-number
            v-model:value="formData.level"
            :min="1"
            placeholder="请输入等级"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="等级名称" required>
          <a-input v-model:value="formData.levelName" placeholder="请输入等级名称" />
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model:value="formData.icon" placeholder="请输入图标（如Emoji）" />
        </a-form-item>
        <a-form-item label="经验值范围" required>
          <a-space>
            <a-input-number
              v-model:value="formData.minExp"
              :min="0"
              placeholder="最小经验值"
              style="width: 150px"
            />
            <span>-</span>
            <a-input-number
              v-model:value="formData.maxExp"
              :min="-1"
              placeholder="最大经验值（-1表示无限）"
              style="width: 200px"
            />
          </a-space>
        </a-form-item>
        <a-form-item label="特权">
          <div>
            <a-tag
              v-for="(privilege, idx) in formData.privileges"
              :key="idx"
              closable
              @close="handleRemovePrivilege(idx)"
              style="margin-bottom: 8px"
            >
              {{ privilege }}
            </a-tag>
          </div>
          <a-space style="margin-top: 8px">
            <a-input
              v-model:value="newPrivilege"
              placeholder="输入特权名称"
              style="width: 200px"
              @press-enter="handleAddPrivilege"
            />
            <a-button @click="handleAddPrivilege">添加</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getLevelConfigList,
  addLevelConfig,
  updateLevelConfig,
  deleteLevelConfig
} from '@/api/config'

// Table columns
const columns = [
  { title: '等级', key: 'levelDisplay', width: 250 },
  { title: '经验值范围', key: 'expRange', width: 200 },
  { title: '特权', key: 'privileges' },
  { title: '操作', key: 'action', width: 150 }
]

// State
const loading = ref(false)
const levelList = ref<any[]>([])

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加等级')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  level: undefined,
  levelName: '',
  minExp: 0,
  maxExp: 0,
  icon: '',
  privileges: []
})

// New privilege input
const newPrivilege = ref('')

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getLevelConfigList()
    if (res.ec === 0) {
      levelList.value = res.data || []
    }
  } catch (error) {
    console.error('Load level config list failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle add
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '添加等级'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑等级'
  Object.assign(formData, {
    id: record.id,
    level: record.level,
    levelName: record.levelName,
    minExp: record.minExp,
    maxExp: record.maxExp,
    icon: record.icon || '',
    privileges: record.privileges ? [...record.privileges] : []
  })
  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteLevelConfig({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete level config failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formData.level) {
    message.error('请输入等级')
    return
  }
  if (!formData.levelName) {
    message.error('请输入等级名称')
    return
  }
  if (formData.minExp === undefined || formData.maxExp === undefined) {
    message.error('请输入经验值范围')
    return
  }

  try {
    if (isEdit.value) {
      const res = await updateLevelConfig(formData)
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addLevelConfig(formData)
      if (res.ec === 0) {
        message.success('添加成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit level config failed:', error)
  }
}

// Handle cancel
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    level: undefined,
    levelName: '',
    minExp: 0,
    maxExp: 0,
    icon: '',
    privileges: []
  })
  newPrivilege.value = ''
}

// Handle add privilege
const handleAddPrivilege = () => {
  if (!newPrivilege.value.trim()) {
    return
  }
  if (formData.privileges.includes(newPrivilege.value)) {
    message.warning('该特权已存在')
    return
  }
  formData.privileges.push(newPrivilege.value.trim())
  newPrivilege.value = ''
}

// Handle remove privilege
const handleRemovePrivilege = (index: number) => {
  formData.privileges.splice(index, 1)
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.level-config-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
