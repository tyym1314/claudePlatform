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
      },
      {
        path: 'dynamic/pinned',
        name: 'PinnedDynamic',
        component: () => import('@/views/dynamic/PinnedDynamic.vue'),
        meta: { title: '置顶动态管理' }
      },
      {
        path: 'dynamic/explore-recommend',
        name: 'ExploreRecommend',
        component: () => import('@/views/dynamic/ExploreRecommend.vue'),
        meta: { title: '探索推荐位配置' }
      },
      {
        path: 'room/manage',
        name: 'RoomManage',
        component: () => import('@/views/room/RoomManage.vue'),
        meta: { title: '房间管理' }
      },
      {
        path: 'room/statistics',
        name: 'RoomStatistics',
        component: () => import('@/views/room/RoomStatistics.vue'),
        meta: { title: '房间数据统计' }
      },
      {
        path: 'user/flow',
        name: 'UserFlow',
        component: () => import('@/views/user/UserFlow.vue'),
        meta: { title: '用户流水查询' }
      },
      {
        path: 'user/ban',
        name: 'UserBan',
        component: () => import('@/views/user/UserBan.vue'),
        meta: { title: '用户封禁管理' }
      },
      {
        path: 'user/client-log',
        name: 'ClientLog',
        component: () => import('@/views/user/ClientLog.vue'),
        meta: { title: '客户端日志查询' }
      },
      {
        path: 'content/gift-wall',
        name: 'GiftWall',
        component: () => import('@/views/content/GiftWall.vue'),
        meta: { title: '礼物墙配置' }
      },
      {
        path: 'content/tag',
        name: 'TagManage',
        component: () => import('@/views/content/TagManage.vue'),
        meta: { title: '标签管理' }
      },
      {
        path: 'content/topic',
        name: 'TopicManage',
        component: () => import('@/views/content/TopicManage.vue'),
        meta: { title: '话题管理' }
      },
      {
        path: 'statistics/dashboard',
        name: 'DataDashboard',
        component: () => import('@/views/statistics/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'notification/push',
        name: 'PushManage',
        component: () => import('@/views/notification/PushManage.vue'),
        meta: { title: '推送通知管理' }
      },
      {
        path: 'report/manage',
        name: 'ReportManage',
        component: () => import('@/views/report/ReportManage.vue'),
        meta: { title: '举报管理' }
      },
      {
        path: 'config/level',
        name: 'LevelConfig',
        component: () => import('@/views/config/LevelConfig.vue'),
        meta: { title: '等级配置' }
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
