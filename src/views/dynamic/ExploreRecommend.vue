<template>
  <div class="explore-recommend-container">
    <a-card title="探索推荐位配置" :bordered="false">
      <!-- Action Bar -->
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          添加推荐
        </a-button>
      </div>

      <!-- Recommendation List -->
      <a-table
        :columns="columns"
        :data-source="recommendList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'targetType'">
            <a-tag :color="getTargetTypeColor(record.targetType)">
              {{ getTargetTypeText(record.targetType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'targetInfo'">
            <div>{{ record.targetName || record.targetId }}</div>
          </template>
          <template v-else-if="column.key === 'timeRange'">
            <div v-if="record.startTime || record.endTime">
              <div v-if="record.startTime">开始: {{ record.startTime }}</div>
              <div v-if="record.endTime">结束: {{ record.endTime }}</div>
            </div>
            <span v-else style="color: #999">永久</span>
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
              <a-popconfirm title="确定删除该推荐吗？" @confirm="handleDelete(record.id)">
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
      width="700px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="推荐类型" required>
          <a-select
            v-model:value="formData.targetType"
            placeholder="请选择推荐类型"
            @change="handleTargetTypeChange"
          >
            <a-select-option :value="1">用户</a-select-option>
            <a-select-option :value="2">房间</a-select-option>
            <a-select-option :value="3">动态</a-select-option>
            <a-select-option :value="4">话题</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="目标ID" required>
          <a-space>
            <a-input-number
              v-model:value="formData.targetId"
              placeholder="请输入目标ID"
              style="width: 200px"
              @change="handleTargetIdChange"
            />
            <a-button @click="handleSearchTarget" :loading="searchLoading">查询</a-button>
          </a-space>
        </a-form-item>

        <a-form-item label="目标信息" v-if="targetPreview">
          <div class="target-preview">
            <div class="preview-info">
              <div v-if="targetPreview.name">名称: {{ targetPreview.name }}</div>
              <div v-if="targetPreview.description">描述: {{ targetPreview.description }}</div>
              <div v-if="targetPreview.coverImage">
                <a-image :width="100" :src="targetPreview.coverImage" />
              </div>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="推荐位置" required>
          <a-input-number
            v-model:value="formData.position"
            :min="1"
            :max="100"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="推荐时间">
          <a-range-picker
            v-model:value="timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            不设置时间则永久推荐
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getExploreRecommendList,
  addExploreRecommend,
  updateExploreRecommend,
  deleteExploreRecommend,
  setExploreRecommendStatus,
  getTargetInfo
} from '@/api/dynamic'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '推荐类型', dataIndex: 'targetType', key: 'targetType', width: 100 },
  { title: '目标ID', dataIndex: 'targetId', key: 'targetId', width: 100 },
  { title: '目标信息', key: 'targetInfo', width: 200 },
  { title: '位置', dataIndex: 'position', key: 'position', width: 80 },
  { title: '推荐时间', key: 'timeRange', width: 200 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150 }
]

// State
const loading = ref(false)
const searchLoading = ref(false)
const recommendList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('添加推荐')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  targetType: undefined,
  targetId: undefined,
  position: 1,
  startTime: undefined,
  endTime: undefined
})

// Time range
const timeRange = ref<[Dayjs, Dayjs] | null>(null)

// Target preview
const targetPreview = ref<any>(null)

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getExploreRecommendList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.ec === 0) {
      recommendList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load explore recommend list failed:', error)
  } finally {
    loading.value = false
  }
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
  modalTitle.value = '添加推荐'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑推荐'
  Object.assign(formData, {
    id: record.id,
    targetType: record.targetType,
    targetId: record.targetId,
    position: record.position,
    startTime: record.startTime,
    endTime: record.endTime
  })

  // Set time range
  if (record.startTime && record.endTime) {
    timeRange.value = [dayjs(record.startTime), dayjs(record.endTime)]
  } else {
    timeRange.value = null
  }

  // Set preview
  targetPreview.value = {
    name: record.targetName,
    description: record.targetDescription,
    coverImage: record.targetCoverImage
  }

  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const res = await deleteExploreRecommend({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete explore recommend failed:', error)
  }
}

// Handle status change
const handleStatusChange = async (record: any, checked: boolean) => {
  try {
    const res = await setExploreRecommendStatus({
      id: record.id,
      status: checked ? 1 : 0
    })
    if (res.ec === 0) {
      message.success('状态更新成功')
      loadData()
    }
  } catch (error) {
    console.error('Set explore recommend status failed:', error)
  }
}

// Handle target type change
const handleTargetTypeChange = () => {
  formData.targetId = undefined
  targetPreview.value = null
}

// Handle target id change
const handleTargetIdChange = () => {
  targetPreview.value = null
}

// Handle search target
const handleSearchTarget = async () => {
  if (!formData.targetType) {
    message.error('请先选择推荐类型')
    return
  }
  if (!formData.targetId) {
    message.error('请输入目标ID')
    return
  }

  searchLoading.value = true
  try {
    const res = await getTargetInfo({
      targetType: formData.targetType,
      targetId: formData.targetId
    })
    if (res.ec === 0 && res.data) {
      targetPreview.value = {
        name: res.data.name,
        description: res.data.description,
        coverImage: res.data.coverImage
      }
      message.success('查询成功')
    } else {
      message.error('未找到该目标')
      targetPreview.value = null
    }
  } catch (error) {
    console.error('Search target failed:', error)
    targetPreview.value = null
  } finally {
    searchLoading.value = false
  }
}

// Handle submit
const handleSubmit = async () => {
  // Validate
  if (!formData.targetType) {
    message.error('请选择推荐类型')
    return
  }
  if (!formData.targetId) {
    message.error('请输入目标ID')
    return
  }
  if (!formData.position) {
    message.error('请输入推荐位置')
    return
  }
  if (!isEdit.value && !targetPreview.value) {
    message.error('请先查询目标')
    return
  }

  // Prepare data
  const submitData: any = {
    targetType: formData.targetType,
    targetId: formData.targetId,
    position: formData.position
  }

  if (timeRange.value && timeRange.value.length === 2) {
    submitData.startTime = dayjs(timeRange.value[0]).format('YYYY-MM-DD HH:mm:ss')
    submitData.endTime = dayjs(timeRange.value[1]).format('YYYY-MM-DD HH:mm:ss')
  }

  try {
    if (isEdit.value) {
      const res = await updateExploreRecommend({ ...submitData, id: formData.id })
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addExploreRecommend(submitData)
      if (res.ec === 0) {
        message.success('添加推荐成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit explore recommend failed:', error)
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
    targetType: undefined,
    targetId: undefined,
    position: 1,
    startTime: undefined,
    endTime: undefined
  })
  timeRange.value = null
  targetPreview.value = null
}

// Get target type color
const getTargetTypeColor = (type: number) => {
  const colorMap: Record<number, string> = {
    1: 'blue',
    2: 'green',
    3: 'orange',
    4: 'purple'
  }
  return colorMap[type] || 'default'
}

// Get target type text
const getTargetTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '用户',
    2: '房间',
    3: '动态',
    4: '话题'
  }
  return textMap[type] || '未知'
}

// Load data on mount
loadData()
</script>

<style scoped lang="less">
.explore-recommend-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 16px;
}

.target-preview {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;

  .preview-info {
    > div {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
