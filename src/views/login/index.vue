<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-logo">
        <h1>Chatna运营管理后台</h1>
        <p>Chatna Operation Management Platform</p>
      </div>
      <a-form
        :model="loginForm"
        :rules="rules"
        @finish="handleLogin"
        class="login-form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="loginForm.username"
            size="large"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="loginForm.password"
            size="large"
            placeholder="请输入密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { login, getUserInfo, getMenuInfo } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import type { LoginParams } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    loading.value = true

    // Login
    const res = await login(loginForm)
    const token = res.token

    if (!token) {
      throw new Error('登录失败,未获取到token')
    }

    // Store token
    userStore.setToken(token)

    // Get user info
    const userInfo = await getUserInfo({ userId: res.userId })
    userStore.setUserInfo(userInfo)

    // Get menu info
    const menuInfo = await getMenuInfo({ userId: res.userId })
    userStore.setMenuList(menuInfo.menus || [])

    message.success('登录成功')
    router.push({ name: 'Dashboard' })
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-logo p {
  font-size: 14px;
  color: #999;
}

.login-form {
  margin-top: 20px;
}
</style>
