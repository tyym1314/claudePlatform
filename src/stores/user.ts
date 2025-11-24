import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo, LoginParams } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const menuList = ref<any[]>([])

    // Set token
    function setToken(newToken: string) {
      token.value = newToken
    }

    // Set user info
    function setUserInfo(info: UserInfo) {
      userInfo.value = info
    }

    // Set menu list
    function setMenuList(menus: any[]) {
      menuList.value = menus
    }

    // Clear all state
    function clearState() {
      token.value = ''
      userInfo.value = null
      menuList.value = []
    }

    // Logout
    async function logout() {
      clearState()
    }

    return {
      token,
      userInfo,
      menuList,
      setToken,
      setUserInfo,
      setMenuList,
      clearState,
      logout
    }
  },
  {
    persist: {
      key: 'chatna-user',
      storage: localStorage,
      paths: ['token', 'userInfo']
    }
  }
)
