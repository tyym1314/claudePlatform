<template>
  <div class="tag-manage-container">
    <a-card title="标签管理" :bordered="false">
      <!-- Search and Action Bar -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="标签名称">
            <a-input
              v-model:value="searchForm.tagName"
              placeholder="请输入标签名称"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="标签类型">
            <a-select
              v-model:value="searchForm.tagType"
              placeholder="请选择类型"
              style="width: 150px"
              allow-clear
            >
              <a-select-option :value="1">用户标签</a-select-option>
              <a-select-option :value="2">内容标签</a-select-option>
              <a-select-option :value="3">房间标签</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                添加标签
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Tag Table -->
      <a-table
        :columns="columns"
        :data-source="tagList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'tagName'">
            <a-tag :color="record.color || 'default'">
              <template #icon v-if="record.icon">
                <span>{{ record.icon }}</span>
              </template>
              {{ record.tagName }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'tagType'">
            {{ getTagTypeText(record.tagType) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除该标签吗？" @confirm="handleDelete(record.id)">
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
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="标签名称" required>
          <a-input v-model:value="formData.tagName" placeholder="请输入标签名称" />
        </a-form-item>
        <a-form-item label="标签类型" required>
          <a-select v-model:value="formData.tagType" placeholder="请选择类型">
            <a-select-option :value="1">用户标签</a-select-option>
            <a-select-option :value="2">内容标签</a-select-option>
            <a-select-option :value="3">房间标签</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model:value="formData.icon" placeholder="请输入图标（如Emoji）" />
        </a-form-item>
        <a-form-item label="颜色">
          <a-select v-model:value="formData.color" placeholder="请选择颜色">
            <a-select-option value="blue">蓝色</a-select-option>
            <a-select-option value="green">绿色</a-select-option>
            <a-select-option value="red">红色</a-select-option>
            <a-select-option value="orange">橙色</a-select-option>
            <a-select-option value="purple">紫色</a-select-option>
            <a-select-option value="cyan">青色</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number
            v-model:value="formData.sort"
            :min="0"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
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
  getTagList,
  addTag,
  updateTag,
  deleteTag,
  setTagStatus
} from '@/api/content'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '标签名称', dataIndex: 'tagName', key: 'tagName' },
  { title: '标签类型', dataIndex: 'tagType', key: 'tagType', width: 120 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150 }
]

// Search form
const searchForm = reactive<any>({
  tagName: '',
  tagType: undefined
})

// State
const loading = ref(false)
const tagList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加标签')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  tagName: '',
  tagType: undefined,
  icon: '',
  color: 'blue',
  sort: 0
})

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getTagList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      tagName: searchForm.tagName || undefined,
      tagType: searchForm.tagType
    })
    if (res.ec === 0) {
      tagList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load tag list failed:', error)
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
  searchForm.tagName = ''
  searchForm.tagType = undefined
  pagination.current = 1
  loadData()
}

// Handle table change
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// Handle add
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '添加标签'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑标签'
  Object.assign(formData, {
    id: record.id,
    tagName: record.tagName,
    tagType: record.tagType,
    icon: record.icon || '',
    color: record.color || 'blue',
    sort: record.sort || 0
  })
  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteTag({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete tag failed:', error)
  }
}

// Handle status change
const handleStatusChange = async (record: any, checked: boolean) => {
  try {
    const res = await setTagStatus({
      id: record.id,
      status: checked ? 1 : 0
    })
    if (res.ec === 0) {
      message.success('状态更新成功')
      loadData()
    }
  } catch (error) {
    console.error('Set tag status failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formData.tagName) {
    message.error('请输入标签名称')
    return
  }
  if (!formData.tagType) {
    message.error('请选择标签类型')
    return
  }

  try {
    if (isEdit.value) {
      const res = await updateTag(formData)
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addTag(formData)
      if (res.ec === 0) {
        message.success('添加成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit tag failed:', error)
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
    tagName: '',
    tagType: undefined,
    icon: '',
    color: 'blue',
    sort: 0
  })
}

// Get tag type text
const getTagTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '用户标签',
    2: '内容标签',
    3: '房间标签'
  }
  return textMap[type] || '未知'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.tag-manage-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
