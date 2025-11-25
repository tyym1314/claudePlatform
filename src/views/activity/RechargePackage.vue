<template>
  <div class="recharge-package-container">
    <a-card title="礼包配置管理" :bordered="false">
      <!-- Search and Action Bar -->
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增礼包
        </a-button>
      </div>

      <!-- Gift Package Table -->
      <a-table
        :columns="columns"
        :data-source="packageList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'packImage'">
            <a-image :width="80" :src="record.packImage" />
          </template>
          <template v-else-if="column.key === 'originalPrice'">
            ${{ (record.originalPrice / 100).toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'discountPrice'">
            ${{ (record.discountPrice / 100).toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'items'">
            <a-tag v-for="(item, index) in record.items" :key="index" color="blue">
              {{ item.itemName }} x{{ item.itemNum }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除该礼包吗？" @confirm="handleDelete(record.id)">
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
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="礼包名称" required>
          <a-input v-model:value="formData.packName" placeholder="请输入礼包名称" />
        </a-form-item>
        <a-form-item label="礼包图片" required>
          <div>
            <a-upload
              list-type="picture-card"
              :file-list="fileList"
              :before-upload="beforeUpload"
              @remove="handleRemoveImage"
            >
              <div v-if="fileList.length < 1">
                <plus-outlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
          </div>
        </a-form-item>
        <a-form-item label="原价（美分）" required>
          <a-input-number
            v-model:value="formData.originalPrice"
            :min="0"
            style="width: 100%"
            placeholder="请输入原价（美分）"
          />
        </a-form-item>
        <a-form-item label="折扣价（美分）" required>
          <a-input-number
            v-model:value="formData.discountPrice"
            :min="0"
            style="width: 100%"
            placeholder="请输入折扣价（美分）"
          />
        </a-form-item>
        <a-form-item label="礼包内容" required>
          <div v-for="(item, index) in formData.items" :key="index" class="item-row">
            <a-space>
              <a-select
                v-model:value="item.itemType"
                placeholder="选择类型"
                style="width: 150px"
                @change="() => handleItemTypeChange(index)"
              >
                <a-select-option
                  v-for="type in itemTypeList"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
              <a-input-number
                v-model:value="item.itemId"
                placeholder="物品ID"
                style="width: 120px"
                @change="() => handleItemIdChange(index)"
              />
              <span v-if="item.itemName" class="item-info">{{ item.itemName }}</span>
              <a-input-number
                v-model:value="item.itemNum"
                :min="1"
                placeholder="数量"
                style="width: 100px"
              />
              <a-button
                type="link"
                danger
                size="small"
                @click="handleRemoveItem(index)"
                v-if="formData.items.length > 1"
              >
                删除
              </a-button>
            </a-space>
          </div>
          <a-button type="dashed" block @click="handleAddItem" style="margin-top: 10px">
            <plus-outlined /> 添加物品
          </a-button>
        </a-form-item>
        <a-form-item label="显示顺序">
          <a-input-number
            v-model:value="formData.sort"
            :min="0"
            style="width: 100%"
            placeholder="数字越小越靠前"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'
import {
  getGiftPackList,
  addGiftPack,
  updateGiftPack,
  deleteGiftPack,
  getGiftItemTypeList,
  getGiftItemInfo,
  uploadStaticResource
} from '@/api/activity'

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '礼包名称', dataIndex: 'packName', key: 'packName' },
  { title: '礼包图片', dataIndex: 'packImage', key: 'packImage', width: 120 },
  { title: '原价', dataIndex: 'originalPrice', key: 'originalPrice', width: 100 },
  { title: '折扣价', dataIndex: 'discountPrice', key: 'discountPrice', width: 100 },
  { title: '礼包内容', dataIndex: 'items', key: 'items' },
  { title: '顺序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '操作', key: 'action', width: 150 }
]

// State
const loading = ref(false)
const packageList = ref<any[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// Modal state
const modalVisible = ref(false)
const modalTitle = ref('新增礼包')
const isEdit = ref(false)
const formData = reactive<any>({
  id: undefined,
  packName: '',
  packImage: '',
  originalPrice: undefined,
  discountPrice: undefined,
  items: [{ itemType: '', itemId: undefined, itemName: '', itemNum: 1 }],
  sort: 0
})

// Upload state
const fileList = ref<any[]>([])

// Item type list
const itemTypeList = ref<any[]>([])

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const res = await getGiftPackList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.ec === 0) {
      packageList.value = res.data.list || []
      pagination.total = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('Load gift pack list failed:', error)
  } finally {
    loading.value = false
  }
}

// Load item type list
const loadItemTypeList = async () => {
  try {
    const res = await getGiftItemTypeList()
    if (res.ec === 0 && res.data) {
      itemTypeList.value = res.data.map((item: any) => ({
        value: item.type,
        label: item.name
      }))
    }
  } catch (error) {
    console.error('Load item type list failed:', error)
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
  modalTitle.value = '新增礼包'
  resetForm()
  modalVisible.value = true
}

// Handle edit
const handleEdit = (record: any) => {
  isEdit.value = true
  modalTitle.value = '编辑礼包'
  Object.assign(formData, {
    id: record.id,
    packName: record.packName,
    packImage: record.packImage,
    originalPrice: record.originalPrice,
    discountPrice: record.discountPrice,
    items: record.items && record.items.length > 0
      ? record.items.map((item: any) => ({ ...item }))
      : [{ itemType: '', itemId: undefined, itemName: '', itemNum: 1 }],
    sort: record.sort || 0
  })

  // Set file list for image preview
  if (record.packImage) {
    fileList.value = [
      {
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.packImage
      }
    ]
  }

  modalVisible.value = true
}

// Handle delete
const handleDelete = async (id: string) => {
  try {
    const res = await deleteGiftPack({ id })
    if (res.ec === 0) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    console.error('Delete gift pack failed:', error)
  }
}

// Handle submit
const handleSubmit = async () => {
  // Validate
  if (!formData.packName) {
    message.error('请输入礼包名称')
    return
  }
  if (!formData.packImage) {
    message.error('请上传礼包图片')
    return
  }
  if (!formData.originalPrice) {
    message.error('请输入原价')
    return
  }
  if (!formData.discountPrice) {
    message.error('请输入折扣价')
    return
  }
  if (!formData.items || formData.items.length === 0) {
    message.error('请添加至少一个礼包物品')
    return
  }
  for (const item of formData.items) {
    if (!item.itemType || !item.itemId || !item.itemNum) {
      message.error('请完整填写礼包物品信息')
      return
    }
  }

  try {
    const submitData = {
      packName: formData.packName,
      packImage: formData.packImage,
      originalPrice: formData.originalPrice,
      discountPrice: formData.discountPrice,
      items: formData.items.map((item: any) => ({
        itemType: item.itemType,
        itemId: item.itemId,
        itemNum: item.itemNum
      })),
      sort: formData.sort || 0
    }

    if (isEdit.value) {
      const res = await updateGiftPack({ ...submitData, id: formData.id })
      if (res.ec === 0) {
        message.success('更新成功')
        modalVisible.value = false
        loadData()
      }
    } else {
      const res = await addGiftPack(submitData)
      if (res.ec === 0) {
        message.success('添加成功')
        modalVisible.value = false
        loadData()
      }
    }
  } catch (error) {
    console.error('Submit gift pack failed:', error)
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
    packName: '',
    packImage: '',
    originalPrice: undefined,
    discountPrice: undefined,
    items: [{ itemType: '', itemId: undefined, itemName: '', itemNum: 1 }],
    sort: 0
  })
  fileList.value = []
}

// Handle image upload
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB！')
    return false
  }

  // Upload file
  const formDataUpload = new FormData()
  formDataUpload.append('file', file)

  try {
    const res = await uploadStaticResource(formDataUpload)
    if (res.ec === 0 && res.data) {
      formData.packImage = res.data.url
      fileList.value = [
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: res.data.url
        }
      ]
      message.success('图片上传成功')
    }
  } catch (error) {
    message.error('图片上传失败')
    console.error('Upload image failed:', error)
  }

  return false
}

// Handle remove image
const handleRemoveImage = () => {
  formData.packImage = ''
  fileList.value = []
}

// Handle add item
const handleAddItem = () => {
  formData.items.push({ itemType: '', itemId: undefined, itemName: '', itemNum: 1 })
}

// Handle remove item
const handleRemoveItem = (index: number) => {
  formData.items.splice(index, 1)
}

// Handle item type change
const handleItemTypeChange = (index: number) => {
  formData.items[index].itemId = undefined
  formData.items[index].itemName = ''
}

// Handle item id change
const handleItemIdChange = async (index: number) => {
  const item = formData.items[index]
  if (item.itemType && item.itemId) {
    try {
      const res = await getGiftItemInfo({
        itemType: item.itemType,
        itemId: item.itemId
      })
      if (res.ec === 0 && res.data) {
        item.itemName = res.data.itemName || ''
      }
    } catch (error) {
      console.error('Get gift item info failed:', error)
    }
  }
}

onMounted(() => {
  loadData()
  loadItemTypeList()
})
</script>

<style scoped lang="less">
.recharge-package-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 16px;
}

.item-row {
  margin-bottom: 8px;
}

.item-info {
  color: #1890ff;
  font-size: 12px;
}
</style>
