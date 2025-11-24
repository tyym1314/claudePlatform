<template>
  <div class="dashboard">
    <h1>欢迎使用Chatna运营管理后台系统</h1>
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日用户" :value="11280" class="stat-card" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="待审核提现" :value="93" suffix="笔" class="stat-card" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="活跃主播" :value="1280" class="stat-card" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="活跃公会" :value="32" class="stat-card" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="content-row">
      <a-col :span="12">
        <a-card title="快捷入口">
          <div class="quick-links">
            <a-button type="link" @click="router.push('/user/info')">用户管理</a-button>
            <a-button type="link" @click="router.push('/withdrawal/examine')">提现审核</a-button>
            <a-button type="link" @click="router.push('/activity/banner')">Banner配置</a-button>
            <a-button type="link" @click="router.push('/system/user')">系统管理</a-button>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="系统公告">
          <a-list :data-source="announcements" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :description="item.date">
                  <template #title>
                    {{ item.title }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const announcements = [
  { title: '系统升级通知', date: '2024-11-24' },
  { title: '新功能上线', date: '2024-11-20' },
  { title: '数据迁移完成', date: '2024-11-15' }
]
</script>

<style scoped>
.dashboard h1 {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
}

.stats-row {
  margin-bottom: 16px;
}

.content-row {
  margin-top: 16px;
}

.stat-card {
  padding: 12px 0;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
