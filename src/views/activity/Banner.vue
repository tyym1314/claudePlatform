<template>
  <div class="banner-page">
    <a-card title="Banner配置" :bordered="false">
      <!-- Action Buttons -->
      <div class="action-bar">
        <a-button type="primary" @click="showAddModal">新增Banner</a-button>
      </div>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="bannerList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        class="data-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'imageUrl'">
            <a-image :src="record.imageUrl" :width="100" />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="handleStatusChange(record)"
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </template>
          <template v-else-if="column.key === 'time'">
            <div>{{ formatTime(record.startTime) }}</div>
            <div>{{ formatTime(record.endTime) }}</div>
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
      width="700px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="Banner标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入Banner标题" />
        </a-form-item>
        <a-form-item label="Banner图片" required>
          <a-upload
            :file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @remove="handleRemove"
            :max-count="1"
          >
            <div v-if="!formData.imageUrl">
              <div style="margin-top: 8px">上传图片</div>
            </div>
          </a-upload>
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            建议尺寸: 750x300px, 格式: JPG/PNG, 大小: &lt;2MB
          </div>
        </a-form-item>
        <a-form-item label="跳转链接">
          <a-input v-model:value="formData.jumpUrl" placeholder="请输入跳转链接" />
        </a-form-item>
        <a-form-item label="展示位置" required>
          <a-select v-model:value="formData.position" placeholder="请选择展示位置">
            <a-select-option value="home">首页</a-select-option>
            <a-select-option value="activity">活动页</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="展示时间" required>
          <a-range-picker
            v-model:value="timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="优先级">
          <a-input-number
            v-model:value="formData.priority"
            :min="0"
            placeholder="数字越小优先级越高"
            style="width: 100%"
          />
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
import { ref, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getBannerList,
  addBanner,
  updateBanner,
  setBannerStatus,
  deleteBanner,
  uploadStaticResource
} from '@/api/activity'

const loading = ref(false)
const bannerList = ref<any[]>([])
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const fileList = ref<any[]>([])
const timeRange = ref<[Dayjs, Dayjs]>()

const searchForm = reactive({
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

const formData = reactive({
  id: undefined as number | undefined,
  title: '',
  imageUrl: '',
  jumpUrl: '',
  position: 'home',
  startTime: 0,
  endTime: 0,
  priority: 1,
  status: 1
})

const modalTitle = computed(() => (isEdit.value ? '编辑Banner' : '新增Banner'))

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '图片', key: 'imageUrl', width: 120 },
  { title: '位置', dataIndex: 'position', key: 'position', width: 100 },
  { title: '展示时间', key: 'time', width: 200 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

onMounted(() => {
  fetchBannerList()
})

async function fetchBannerList() {
  try {
    loading.value = true
    const res = await getBannerList(searchForm)
    bannerList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch banner list error:', error)
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag: any) {
  searchForm.pageNo = pag.current
  searchForm.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchBannerList()
}

function showAddModal() {
  isEdit.value = false
  formData.id = undefined
  formData.title = ''
  formData.imageUrl = ''
  formData.jumpUrl = ''
  formData.position = 'home'
  formData.startTime = 0
  formData.endTime = 0
  formData.priority = 1
  formData.status = 1
  fileList.value = []
  timeRange.value = undefined
  modalVisible.value = true
}

function showEditModal(record: any) {
  isEdit.value = true
  formData.id = record.id
  formData.title = record.title
  formData.imageUrl = record.imageUrl
  formData.jumpUrl = record.jumpUrl
  formData.position = record.position
  formData.startTime = record.startTime
  formData.endTime = record.endTime
  formData.priority = record.priority
  formData.status = record.status

  if (record.imageUrl) {
    fileList.value = [
      {
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.imageUrl
      }
    ]
  }

  if (record.startTime && record.endTime) {
    timeRange.value = [dayjs(record.startTime), dayjs(record.endTime)]
  }

  modalVisible.value = true
}

async function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB')
    return false
  }

  // Upload file
  const formDataObj = new FormData()
  formDataObj.append('file', file)
  formDataObj.append('type', 'image')

  try {
    const res = await uploadStaticResource(formDataObj)
    formData.imageUrl = res.url
    fileList.value = [
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: res.url
      }
    ]
    message.success('上传成功')
  } catch (error) {
    message.error('上传失败')
    console.error('Upload error:', error)
  }

  return false
}

function handleRemove() {
  formData.imageUrl = ''
  fileList.value = []
}

async function handleStatusChange(record: any) {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await setBannerStatus({ id: record.id, status: newStatus })
    message.success('状态更新成功')
    fetchBannerList()
  } catch (error) {
    console.error('Status change error:', error)
  }
}

async function handleSubmit() {
  if (!formData.title) {
    message.error('请输入Banner标题')
    return
  }
  if (!formData.imageUrl) {
    message.error('请上传Banner图片')
    return
  }
  if (!timeRange.value) {
    message.error('请选择展示时间')
    return
  }

  formData.startTime = timeRange.value[0].valueOf()
  formData.endTime = timeRange.value[1].valueOf()

  try {
    modalLoading.value = true
    if (isEdit.value) {
      await updateBanner(formData)
      message.success('更新成功')
    } else {
      await addBanner(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    fetchBannerList()
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    modalLoading.value = false
  }
}

function handleDelete(record: any) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除Banner "${record.title}" 吗？`,
    onOk: async () => {
      try {
        await deleteBanner({ id: record.id })
        message.success('删除成功')
        fetchBannerList()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  })
}

function formatTime(timestamp: number) {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// Import onMounted
import { onMounted } from 'vue'
</script>

<style scoped>
.banner-page {
  padding: 0;
}

.action-bar {
  margin-bottom: 16px;
}

.data-table {
  margin-top: 16px;
}
</style>
