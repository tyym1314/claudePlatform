<template>
  <div class="user-ban-container">
    <a-card title="用户封禁管理" :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- User Ban Tab -->
        <a-tab-pane key="user" tab="用户封禁">
          <div class="ban-section">
            <a-card size="small" title="封禁用户" style="margin-bottom: 20px">
              <a-form layout="inline" :model="userBanForm">
                <a-form-item label="用户ID" required>
                  <a-input
                    v-model:value="userBanForm.userId"
                    placeholder="请输入用户ID"
                    style="width: 200px"
                  />
                </a-form-item>
                <a-form-item label="封禁时长" required>
                  <a-select
                    v-model:value="userBanForm.prohibitTime"
                    placeholder="请选择封禁时长"
                    style="width: 200px"
                  >
                    <a-select-option :value="3600">1小时</a-select-option>
                    <a-select-option :value="86400">1天</a-select-option>
                    <a-select-option :value="259200">3天</a-select-option>
                    <a-select-option :value="604800">7天</a-select-option>
                    <a-select-option :value="2592000">30天</a-select-option>
                    <a-select-option :value="-1">永久</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button
                    type="primary"
                    danger
                    @click="handleBanUser"
                    :loading="userBanLoading"
                  >
                    封禁用户
                  </a-button>
                </a-form-item>
              </a-form>
            </a-card>

            <a-card size="small" title="解封用户">
              <a-form layout="inline" :model="userUnbanForm">
                <a-form-item label="用户ID" required>
                  <a-input
                    v-model:value="userUnbanForm.userId"
                    placeholder="请输入用户ID"
                    style="width: 200px"
                  />
                </a-form-item>
                <a-form-item>
                  <a-button
                    type="primary"
                    @click="handleUnbanUser"
                    :loading="userUnbanLoading"
                  >
                    解封用户
                  </a-button>
                </a-form-item>
              </a-form>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- Device Ban Tab -->
        <a-tab-pane key="device" tab="设备封禁">
          <div class="ban-section">
            <a-card size="small" title="封禁设备" style="margin-bottom: 20px">
              <a-form layout="inline" :model="deviceBanForm">
                <a-form-item label="设备ID" required>
                  <a-input
                    v-model:value="deviceBanForm.deviceId"
                    placeholder="请输入设备ID"
                    style="width: 300px"
                  />
                </a-form-item>
                <a-form-item label="封禁时长" required>
                  <a-select
                    v-model:value="deviceBanForm.prohibitTime"
                    placeholder="请选择封禁时长"
                    style="width: 200px"
                  >
                    <a-select-option :value="3600">1小时</a-select-option>
                    <a-select-option :value="86400">1天</a-select-option>
                    <a-select-option :value="259200">3天</a-select-option>
                    <a-select-option :value="604800">7天</a-select-option>
                    <a-select-option :value="2592000">30天</a-select-option>
                    <a-select-option :value="-1">永久</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button
                    type="primary"
                    danger
                    @click="handleBanDevice"
                    :loading="deviceBanLoading"
                  >
                    封禁设备
                  </a-button>
                </a-form-item>
              </a-form>
            </a-card>

            <a-card size="small" title="解封设备">
              <a-form layout="inline" :model="deviceUnbanForm">
                <a-form-item label="设备ID" required>
                  <a-input
                    v-model:value="deviceUnbanForm.deviceId"
                    placeholder="请输入设备ID"
                    style="width: 300px"
                  />
                </a-form-item>
                <a-form-item>
                  <a-button
                    type="primary"
                    @click="handleUnbanDevice"
                    :loading="deviceUnbanLoading"
                  >
                    解封设备
                  </a-button>
                </a-form-item>
              </a-form>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- Tips -->
      <a-alert
        message="封禁说明"
        type="info"
        show-icon
        style="margin-top: 20px"
      >
        <template #description>
          <ul style="margin: 0; padding-left: 20px">
            <li>用户封禁：封禁后该用户将无法登录和使用应用</li>
            <li>设备封禁：封禁后该设备上的所有用户都无法登录</li>
            <li>封禁时长：选择永久封禁时，需要手动解封才能恢复</li>
            <li>解封操作：输入对应的用户ID或设备ID即可立即解除封禁</li>
          </ul>
        </template>
      </a-alert>

      <!-- Ban Records -->
      <a-card title="最近封禁记录" :bordered="false" style="margin-top: 20px">
        <a-table
          :columns="recordColumns"
          :data-source="banRecords"
          :loading="recordLoading"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'banType'">
              <a-tag :color="record.banType === 'user' ? 'red' : 'orange'">
                {{ record.banType === 'user' ? '用户封禁' : '设备封禁' }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'duration'">
              {{ formatDuration(record.prohibitTime) }}
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'error' : 'success'">
                {{ record.status === 'active' ? '已封禁' : '已解封' }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  prohibitUser,
  relieveUser,
  prohibitDevice,
  relieveDevice
} from '@/api/user'

// Active tab
const activeTab = ref('user')

// User ban form
const userBanForm = reactive({
  userId: '',
  prohibitTime: 86400
})

// User unban form
const userUnbanForm = reactive({
  userId: ''
})

// Device ban form
const deviceBanForm = reactive({
  deviceId: '',
  prohibitTime: 86400
})

// Device unban form
const deviceUnbanForm = reactive({
  deviceId: ''
})

// Loading states
const userBanLoading = ref(false)
const userUnbanLoading = ref(false)
const deviceBanLoading = ref(false)
const deviceUnbanLoading = ref(false)
const recordLoading = ref(false)

// Ban records
const banRecords = ref<any[]>([])

// Record columns
const recordColumns = [
  { title: '类型', key: 'banType', width: 100 },
  { title: '目标ID', dataIndex: 'targetId', key: 'targetId' },
  { title: '封禁时长', key: 'duration', width: 120 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作时间', dataIndex: 'createTime', key: 'createTime', width: 180 }
]

// Handle ban user
const handleBanUser = async () => {
  if (!userBanForm.userId) {
    message.error('请输入用户ID')
    return
  }

  Modal.confirm({
    title: '确认封禁用户',
    content: `确定要封禁用户 ${userBanForm.userId} ${formatDuration(userBanForm.prohibitTime)}吗？`,
    onOk: async () => {
      userBanLoading.value = true
      try {
        const res = await prohibitUser({
          userId: userBanForm.userId,
          prohibitTime: userBanForm.prohibitTime
        })
        if (res.ec === 0) {
          message.success('封禁成功')
          userBanForm.userId = ''
          loadBanRecords()
        }
      } catch (error) {
        console.error('Ban user failed:', error)
      } finally {
        userBanLoading.value = false
      }
    }
  })
}

// Handle unban user
const handleUnbanUser = async () => {
  if (!userUnbanForm.userId) {
    message.error('请输入用户ID')
    return
  }

  Modal.confirm({
    title: '确认解封用户',
    content: `确定要解封用户 ${userUnbanForm.userId} 吗？`,
    onOk: async () => {
      userUnbanLoading.value = true
      try {
        const res = await relieveUser({
          userId: userUnbanForm.userId
        })
        if (res.ec === 0) {
          message.success('解封成功')
          userUnbanForm.userId = ''
          loadBanRecords()
        }
      } catch (error) {
        console.error('Unban user failed:', error)
      } finally {
        userUnbanLoading.value = false
      }
    }
  })
}

// Handle ban device
const handleBanDevice = async () => {
  if (!deviceBanForm.deviceId) {
    message.error('请输入设备ID')
    return
  }

  Modal.confirm({
    title: '确认封禁设备',
    content: `确定要封禁设备 ${deviceBanForm.deviceId} ${formatDuration(deviceBanForm.prohibitTime)}吗？`,
    onOk: async () => {
      deviceBanLoading.value = true
      try {
        const res = await prohibitDevice({
          deviceId: deviceBanForm.deviceId,
          prohibitTime: deviceBanForm.prohibitTime
        })
        if (res.ec === 0) {
          message.success('封禁成功')
          deviceBanForm.deviceId = ''
          loadBanRecords()
        }
      } catch (error) {
        console.error('Ban device failed:', error)
      } finally {
        deviceBanLoading.value = false
      }
    }
  })
}

// Handle unban device
const handleUnbanDevice = async () => {
  if (!deviceUnbanForm.deviceId) {
    message.error('请输入设备ID')
    return
  }

  Modal.confirm({
    title: '确认解封设备',
    content: `确定要解封设备 ${deviceUnbanForm.deviceId} 吗？`,
    onOk: async () => {
      deviceUnbanLoading.value = true
      try {
        const res = await relieveDevice({
          deviceId: deviceUnbanForm.deviceId
        })
        if (res.ec === 0) {
          message.success('解封成功')
          deviceUnbanForm.deviceId = ''
          loadBanRecords()
        }
      } catch (error) {
        console.error('Unban device failed:', error)
      } finally {
        deviceUnbanLoading.value = false
      }
    }
  })
}

// Format duration
const formatDuration = (seconds: number) => {
  if (seconds === -1) return '永久'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`
  return `${Math.floor(seconds / 86400)}天`
}

// Load ban records
const loadBanRecords = async () => {
  recordLoading.value = true
  try {
    // Mock data - replace with actual API call
    banRecords.value = [
      {
        id: 1,
        banType: 'user',
        targetId: '12345',
        prohibitTime: 86400,
        operator: 'admin',
        status: 'active',
        createTime: '2024-01-10 10:00:00'
      },
      {
        id: 2,
        banType: 'device',
        targetId: 'device-abc-123',
        prohibitTime: 259200,
        operator: 'admin',
        status: 'active',
        createTime: '2024-01-10 09:30:00'
      }
    ]
  } catch (error) {
    console.error('Load ban records failed:', error)
  } finally {
    recordLoading.value = false
  }
}

// Load records on mount
loadBanRecords()
</script>

<style scoped lang="less">
.user-ban-container {
  padding: 20px;
}

.ban-section {
  padding: 20px 0;
}
</style>
