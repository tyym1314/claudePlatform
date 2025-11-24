<template>
  <a-layout class="basic-layout">
    <!-- Sider -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      theme="dark"
    >
      <div class="logo">
        <h1 v-if="!collapsed">Chatna</h1>
        <h1 v-else>C</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <template v-for="item in menuList" :key="item.menuId">
          <!-- Menu with children -->
          <a-sub-menu v-if="item.children && item.children.length" :key="item.menuId">
            <template #title>
              <span>{{ item.menuName }}</span>
            </template>
            <a-menu-item
              v-for="child in item.children"
              :key="child.menuId"
              :data-path="child.menuPath"
            >
              {{ child.menuName }}
            </a-menu-item>
          </a-sub-menu>

          <!-- Menu without children -->
          <a-menu-item v-else :key="item.menuId" :data-path="item.menuPath">
            <span>{{ item.menuName }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout>
      <!-- Header -->
      <a-layout-header class="header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <MenuFoldOutlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />

          <!-- Breadcrumb -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar>{{ userInfo?.realName?.charAt(0) || 'U' }}</a-avatar>
              <span class="username">{{ userInfo?.realName || '用户' }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer class="footer">
        Copyright © 2024 Chatna. All Rights Reserved.
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const userInfo = computed(() => userStore.userInfo)
const menuList = computed(() => userStore.menuList)

// Breadcrumb
const breadcrumbList = computed(() => {
  const breadcrumbs: Array<{ title: string; path: string }> = [
    { title: '首页', path: '/dashboard' }
  ]

  if (route.meta.title && route.path !== '/dashboard') {
    breadcrumbs.push({ title: route.meta.title as string, path: route.path })
  }

  return breadcrumbs
})

// Watch route change
watch(
  () => route.path,
  () => {
    updateMenuSelection()
  },
  { immediate: true }
)

// Update menu selection
function updateMenuSelection() {
  const path = route.path
  selectedKeys.value = [path]

  // Find parent menu
  menuList.value.forEach(menu => {
    if (menu.children && menu.children.some((child: any) => child.menuPath === path)) {
      openKeys.value = [String(menu.menuId)]
    }
  })
}

// Handle menu click
function handleMenuClick({ item }: any) {
  const path = item.dataset.path
  if (path && path !== route.path) {
    router.push(path)
  }
}

// Logout
function handleLogout() {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗?',
    onOk: async () => {
      await userStore.logout()
      message.success('已退出登录')
      router.push({ name: 'Login' })
    }
  })
}
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.logo h1 {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header {
  background: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.breadcrumb {
  line-height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  font-size: 14px;
}

.content {
  margin: 16px;
}

.content-wrapper {
  padding: 24px;
  background: white;
  min-height: calc(100vh - 64px - 32px - 69px);
  border-radius: 4px;
}

.footer {
  text-align: center;
  background: white;
  color: #999;
}
</style>
