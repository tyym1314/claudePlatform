<template>
  <div class="topic-manage-container">
    <a-card title="话题管理" :bordered="false">
      <!-- Search and Action Bar -->
      <div class="search-bar">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="话题名称">
            <a-input
              v-model:value="searchForm.topicName"
              placeholder="请输入话题名称"
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              style="width: 120px"
              allow-clear
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                添加话题
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Topic Table -->
      <a-table
        :columns="columns"
        :data-source="topicList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'coverImage'">
            <a-image :width="80" :src="record.coverImage" />
          </template>
          <template v-else-if="column.key === 'statistics'">
            <div>
              <div>参与: {{ record.participantCount || 0 }}</div>
              <div>浏览: {{ record.viewCount || 0 }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewStatistics(record)">
                统计
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除该话题吗？" @confirm="handleDelete(record.id)">
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
        <a-form-item label="话题名称" required>
          <a-input v-model:value="formData.topicName" placeholder="请输入话题名称" />
        </a-form-item>
        <a-form-item label="话题描述">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入话题描述"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="封面图片">
          <a-input v-model:value="formData.coverImage" placeholder="请输入封面图片URL" />
          <div v-if="formData.coverImage" style="margin-top: 8px">
            <a-image :width="100" :src="formData.coverImage" />
          </div>
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

    <!-- Statistics Modal -->
    <a-modal
      v-model:open="statisticsVisible"
      title="话题统计"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentStatistics">
        <a-descriptions-item label="话题ID">{{ currentStatistics.topicId }}</a-descriptions-item>
        <a-descriptions-item label="话题名称">{{ currentStatistics.topicName }}</a-descriptions-item>
        <a-descriptions-item label="参与人数">{{ currentStatistics.participantCount }}</a-descriptions-item>
        <a-descriptions-item label="浏览次数">{{ currentStatistics.viewCount }}</a-descriptions-item>
        <a-descriptions-item label="动态数量">{{ currentStatistics.dynamicCount }}</a-descriptions-item>
        <a-descriptions-item label="评论数量">{{ currentStatistics.commentCount }}</a-descriptions-item>
        <a-descriptions-item label="点赞数量">{{ currentStatistics.likeCount }}</a-descriptions-item>
        <a-descriptions-item label="分享数量">{{ currentStatistics.shareCount }}</a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">{{ currentStatistics.createTime }}</a-descriptions-item>
        <a-descriptions-item label="最后更新" :span="2">{{ currentStatistics.updateTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getTopicList,
  addTopic,
  updateTopic,
  deleteTopic,
  setTopicStatus,
  getTopicStatistics
} from '@/api/content'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '话题名称', dataIndex: 'topicName', key: 'topicName', width: 200 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '封面图片', dataIndex: 'coverImage', key: 'coverImage', width: 120 },
  { title: '统计', key: 'statistics', width: 120 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 200 }
]

// Search form
const searchForm = reactive<any>({
  topicName: '',
  status: undefined
})

// State
const loading = ref(false)
const topicList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加话题')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  topicName: '',
  description: '',
  coverImage: '',
  sort: 0
})

// Statistics modal
const statisticsVisible = ref(false)
const currentStatistics = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getTopicList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      topicName: searchForm.topicName || undefined,
      status: searchForm.status
    })
    if (res.ec === 0) {
      topicList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load topic list failed:', error)
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
  searchForm.topicName = ''
  searchForm.status = undefined
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
  modalTitle.value = '添加话题'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑话题'
  Object.assign(formData, {
    id: record.id,
    topicName: record.topicName,
    description: record.description || '',
    coverImage: record.coverImage || '',
    sort: record.sort || 0
  })
  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteTopic({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete topic failed:', error)
  }
}

// Handle status change
const handleStatusChange = async (record: any, checked: boolean) => {
  try {
    const res = await setTopicStatus({
      id: record.id,
      status: checked ? 1 : 0
    })
    if (res.ec === 0) {
      message.success('状态更新成功')
      loadData()
    }
  } catch (error) {
    console.error('Set topic status failed:', error)
  }
}

// Handle view statistics
const handleViewStatistics = async (record: any) => {
  try {
    const res = await getTopicStatistics({ topicId: record.id })
    if (res.ec === 0 && res.data) {
      currentStatistics.value = res.data
      statisticsVisible.value = true
    }
  } catch (error) {
    console.error('Get topic statistics failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!formData.topicName) {
    message.error('请输入话题名称')
    return
  }

  try {
    if (isEdit.value) {
      const res = await updateTopic(formData)
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addTopic(formData)
      if (res.ec === 0) {
        message.success('添加成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit topic failed:', error)
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
    topicName: '',
    description: '',
    coverImage: '',
    sort: 0
  })
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.topic-manage-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}
</style>
