<template>
  <div class="auto-salary-container">
    <a-card title="自动发薪配置" :bordered="false">
      <!-- Configuration Form -->
      <a-form :model="configForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="自动发薪状态">
          <a-switch
            v-model:checked="configForm.enabled"
            checked-children="开启"
            un-checked-children="关闭"
            @change="handleStatusChange"
          />
          <span style="margin-left: 10px; color: #999">
            {{ configForm.enabled ? '已开启自动发薪' : '已关闭自动发薪' }}
          </span>
        </a-form-item>

        <a-form-item label="发薪日期" v-if="configForm.enabled">
          <a-input-number
            v-model:value="configForm.salaryDay"
            :min="1"
            :max="28"
            placeholder="每月几号发薪（1-28）"
            style="width: 200px"
          />
          <span style="margin-left: 10px; color: #999">每月的这一天自动发放工资</span>
        </a-form-item>

        <a-form-item label="发薪规则" v-if="configForm.enabled">
          <div class="salary-rules">
            <div v-for="(rule, index) in configForm.salaryRules" :key="index" class="rule-item">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-input
                    v-model:value="rule.name"
                    placeholder="规则名称"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="6">
                  <a-input-number
                    v-model:value="rule.minAmount"
                    :min="0"
                    placeholder="最低金额"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="6">
                  <a-input-number
                    v-model:value="rule.rate"
                    :min="0"
                    :max="100"
                    placeholder="提成比例(%)"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="4">
                  <a-button
                    type="link"
                    danger
                    size="small"
                    @click="handleRemoveRule(index)"
                    v-if="configForm.salaryRules.length > 1"
                  >
                    删除
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" block @click="handleAddRule" style="margin-top: 10px">
              <plus-outlined /> 添加规则
            </a-button>
          </div>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="handleSaveConfig" :loading="saveLoading">
              保存配置
            </a-button>
            <a-button @click="loadConfig">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="手动执行发薪" :bordered="false" style="margin-top: 20px">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="选择月份">
          <a-month-picker
            v-model:value="executeMonth"
            placeholder="选择要发薪的月份"
            format="YYYY-MM"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button
              type="primary"
              @click="handleExecuteSalary"
              :loading="executeLoading"
              :disabled="!executeMonth"
            >
              立即执行发薪
            </a-button>
            <a-button @click="handleViewRecords" type="default">
              查看发薪记录
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-alert
        message="提示"
        description="手动执行发薪将立即为所有符合条件的公会成员计算并发放工资，请谨慎操作。"
        type="warning"
        show-icon
        style="margin-top: 20px"
      />
    </a-card>

    <!-- Execution History -->
    <a-card title="最近执行记录" :bordered="false" style="margin-top: 20px">
      <a-table
        :columns="historyColumns"
        :data-source="historyList"
        :loading="historyLoading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '成功' : '失败' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'totalAmount'">
            ${{ (record.totalAmount / 100).toFixed(2) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  getAutoSalaryConfig,
  setAutoSalaryConfig,
  executeAutoSalary
} from '@/api/guild'

const router = useRouter()

// Configuration form
const configForm = reactive<any>({
  enabled: false,
  salaryDay: 1,
  salaryRules: [
    { name: '', minAmount: 0, rate: 0 }
  ]
})

// State
const saveLoading = ref(false)
const executeLoading = ref(false)
const historyLoading = ref(false)
const executeMonth = ref<Dayjs | null>(null)
const historyList = ref<any[]>([])

// History table columns
const historyColumns = [
  { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime' },
  { title: '月份', dataIndex: 'month', key: 'month' },
  { title: '发薪人数', dataIndex: 'totalCount', key: 'totalCount' },
  { title: '发薪总额', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
]

// Load configuration
const loadConfig = async () => {
  try {
    const res = await getAutoSalaryConfig()
    if (res.ec === 0 && res.data) {
      configForm.enabled = res.data.enabled || false
      configForm.salaryDay = res.data.salaryDay || 1
      configForm.salaryRules = res.data.salaryRules && res.data.salaryRules.length > 0
        ? res.data.salaryRules
        : [{ name: '', minAmount: 0, rate: 0 }]
    }
  } catch (error) {
    console.error('Load auto salary config failed:', error)
  }
}

// Handle status change
const handleStatusChange = (checked: boolean) => {
  if (checked) {
    message.info('请配置发薪日期和规则后保存')
  }
}

// Handle save configuration
const handleSaveConfig = async () => {
  // Validate
  if (configForm.enabled) {
    if (!configForm.salaryDay || configForm.salaryDay < 1 || configForm.salaryDay > 28) {
      message.error('请设置有效的发薪日期（1-28号）')
      return
    }
    if (!configForm.salaryRules || configForm.salaryRules.length === 0) {
      message.error('请至少添加一条发薪规则')
      return
    }
    for (const rule of configForm.salaryRules) {
      if (!rule.name || rule.minAmount === undefined || rule.rate === undefined) {
        message.error('请完整填写发薪规则信息')
        return
      }
    }
  }

  saveLoading.value = true
  try {
    const res = await setAutoSalaryConfig({
      enabled: configForm.enabled,
      salaryDay: configForm.salaryDay,
      salaryRules: configForm.salaryRules
    })
    if (res.ec === 0) {
      message.success('保存配置成功')
    }
  } catch (error) {
    console.error('Save auto salary config failed:', error)
  } finally {
    saveLoading.value = false
  }
}

// Handle add rule
const handleAddRule = () => {
  configForm.salaryRules.push({ name: '', minAmount: 0, rate: 0 })
}

// Handle remove rule
const handleRemoveRule = (index: number) => {
  configForm.salaryRules.splice(index, 1)
}

// Handle execute salary
const handleExecuteSalary = async () => {
  if (!executeMonth.value) {
    message.error('请选择要发薪的月份')
    return
  }

  const month = dayjs(executeMonth.value).format('YYYY-MM')

  // Confirm
  const confirmed = await new Promise<boolean>((resolve) => {
    const modal = {
      title: '确认执行发薪',
      content: `确定要为 ${month} 月执行自动发薪吗？此操作将立即计算并发放工资。`,
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    }
    // Use Ant Design Vue modal
    import('ant-design-vue').then(({ Modal }) => {
      Modal.confirm(modal)
    })
  })

  if (!confirmed) return

  executeLoading.value = true
  try {
    const res = await executeAutoSalary({ month })
    if (res.ec === 0) {
      message.success('发薪执行成功')
      executeMonth.value = null
      loadHistory()
    }
  } catch (error) {
    console.error('Execute auto salary failed:', error)
  } finally {
    executeLoading.value = false
  }
}

// Handle view records
const handleViewRecords = () => {
  router.push({ name: 'SalaryRecord' })
}

// Load execution history
const loadHistory = async () => {
  historyLoading.value = true
  try {
    // Mock data for now - replace with actual API call
    historyList.value = [
      {
        id: 1,
        executeTime: '2024-01-05 10:00:00',
        month: '2024-01',
        totalCount: 150,
        totalAmount: 50000000,
        status: 1,
        remark: '自动执行成功'
      },
      {
        id: 2,
        executeTime: '2023-12-05 10:00:00',
        month: '2023-12',
        totalCount: 148,
        totalAmount: 48000000,
        status: 1,
        remark: '自动执行成功'
      }
    ]
  } catch (error) {
    console.error('Load execution history failed:', error)
  } finally {
    historyLoading.value = false
  }
}

onMounted(() => {
  loadConfig()
  loadHistory()
})
</script>

<style scoped lang="less">
.auto-salary-container {
  padding: 20px;
}

.salary-rules {
  .rule-item {
    margin-bottom: 10px;
  }
}
</style>
