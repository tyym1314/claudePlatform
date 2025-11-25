import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'user/info',
        name: 'UserInfo',
        component: () => import('@/views/user/UserInfo.vue'),
        meta: { title: '用户信息管理' }
      },
      {
        path: 'withdrawal/examine',
        name: 'WithdrawalExamine',
        component: () => import('@/views/withdrawal/WithdrawalExamine.vue'),
        meta: { title: '提现审核' }
      },
      {
        path: 'system/user',
        name: 'SysUser',
        component: () => import('@/views/system/SysUser.vue'),
        meta: { title: '系统用户管理' }
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'system/menu',
        name: 'Menu',
        component: () => import('@/views/system/Menu.vue'),
        meta: { title: '菜单管理' }
      },
      {
        path: 'activity/banner',
        name: 'Banner',
        component: () => import('@/views/activity/Banner.vue'),
        meta: { title: 'Banner配置' }
      },
      {
        path: 'activity/gift',
        name: 'Gift',
        component: () => import('@/views/activity/Gift.vue'),
        meta: { title: '礼物配置' }
      },
      {
        path: 'activity/recharge-package',
        name: 'RechargePackage',
        component: () => import('@/views/activity/RechargePackage.vue'),
        meta: { title: '充值礼包配置' }
      },
      {
        path: 'guild/auto-salary',
        name: 'AutoSalary',
        component: () => import('@/views/guild/AutoSalary.vue'),
        meta: { title: '自动发薪配置' }
      },
      {
        path: 'guild/salary-record',
        name: 'SalaryRecord',
        component: () => import('@/views/guild/SalaryRecord.vue'),
        meta: { title: '工资发放记录' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.meta.requiresAuth !== false && !token) {
    // Requires auth but no token
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    // Already logged in, redirect to dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
