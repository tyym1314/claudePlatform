# Chatna运营管理后台系统 - 部署与使用文档

## 项目概述

这是一个基于Vue 3 + TypeScript + Ant Design Vue开发的B端运营管理后台系统，用于chatna语音社交平台的运营管理。

### 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.3+
- **构建工具**: Vite 5.0+
- **UI组件库**: Ant Design Vue 4.0+
- **状态管理**: Pinia 2.1+
- **路由管理**: Vue Router 4.2+
- **HTTP客户端**: Axios 1.6+
- **日期处理**: Day.js 1.11+

### 项目特点

- ✅ 使用最新的Vue 3 Composition API
- ✅ 完整的TypeScript类型支持
- ✅ 企业级UI组件库Ant Design Vue
- ✅ 统一的HTTP请求封装和错误处理
- ✅ JWT Token认证和路由守卫
- ✅ Pinia状态持久化
- ✅ 响应式布局设计
- ✅ 模块化代码组织

## 一、环境要求

### 必需环境

- **Node.js**: >= 16.0.0 (推荐18.x或20.x LTS版本)
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0

### 检查环境版本

```bash
node -v    # 应显示 v16.x.x 或更高
npm -v     # 应显示 8.x.x 或更高
```

## 二、本地开发

### 1. 克隆项目

```bash
git clone <repository-url>
cd claudePlatform
```

### 2. 安装依赖

由于在受限网络环境中创建，请在**本地开发环境**中执行：

```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 如果遇到网络问题，可以使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 3. 配置后端API地址

编辑 `vite.config.ts` 文件，修改代理配置：

```typescript
export default defineConfig({
  // ...
  server: {
    port: 3000,
    proxy: {
      '/java/api': {
        target: 'http://your-backend-server.com',  // 修改为实际的后端服务器地址
        changeOrigin: true
      }
    }
  }
})
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可看到登录页面。

### 5. 登录系统

使用提供的测试账号登录：
- 用户名: tyym
- 密码: Aihh1314*

## 三、项目结构

```
claudePlatform/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口层
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── user.ts       # 用户管理接口
│   │   ├── withdrawal.ts  # 提现管理接口
│   │   └── system.ts     # 系统管理接口
│   ├── assets/           # 资源文件
│   ├── components/       # 通用组件
│   ├── layouts/          # 布局组件
│   │   └── BasicLayout.vue  # 基础布局(含侧边栏和导航栏)
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义和守卫
│   ├── stores/           # Pinia状态管理
│   │   └── user.ts       # 用户状态
│   ├── types/            # TypeScript类型定义
│   │   ├── user.ts       # 系统用户类型
│   │   ├── app-user.ts   # 应用用户类型
│   │   └── withdrawal.ts  # 提现相关类型
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios封装
│   ├── views/            # 页面组件
│   │   ├── login/        # 登录页
│   │   ├── dashboard/    # 首页
│   │   ├── user/         # 用户管理
│   │   │   └── UserInfo.vue  # 用户信息管理
│   │   ├── withdrawal/   # 提现管理
│   │   │   └── WithdrawalExamine.vue  # 提现审核
│   │   └── error/        # 错误页面
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── env.d.ts          # 环境类型声明
├── index.html            # HTML入口
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目说明

```

## 四、功能模块说明

### 1. 登录模块
- **路径**: `/login`
- **功能**:
  - 用户名密码登录
  - JWT Token存储
  - 自动跳转
  - 登录状态持久化

### 2. 首页（Dashboard）
- **路径**: `/dashboard`
- **功能**:
  - 数据统计展示
  - 快捷入口
  - 系统公告

### 3. 用户信息管理
- **路径**: `/user/info`
- **功能**:
  - 用户列表查询（支持多条件筛选）
  - 用户详情查看
  - 下发钻石（单个/批量）
  - 下发金币
  - 查看流水记录（钻石/金币）
  - 用户封禁/解封
  - 设置用户等级
  - BD标识管理

### 4. 提现审核
- **路径**: `/withdrawal/examine`
- **功能**:
  - 提现订单列表查询
  - 待审核总额统计
  - 订单详情查看
  - 单个审核（通过/拒绝）
  - 批量审核
  - 审核备注
  - 数据导出

## 五、开发指南

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在布局菜单中添加菜单项（由后端接口返回）

### 添加新API接口

1. 在 `src/types/` 中定义TypeScript类型
2. 在 `src/api/` 中创建API函数
3. 在组件中导入并使用

示例：

```typescript
// src/types/example.ts
export interface Example {
  id: number
  name: string
}

// src/api/example.ts
import request from '@/utils/request'
import type { Example } from '@/types/example'

export function getExampleList() {
  return request<Example[]>({
    url: '/api/example/list',
    method: 'get'
  })
}

// src/views/example/index.vue
import { getExampleList } from '@/api/example'

async function fetchData() {
  const data = await getExampleList()
  console.log(data)
}
```

### 状态管理

使用Pinia进行状态管理，支持自动持久化：

```typescript
// src/stores/example.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore(
  'example',
  () => {
    const data = ref<any>(null)

    function setData(newData: any) {
      data.value = newData
    }

    return { data, setData }
  },
  {
    persist: {
      key: 'example-store',
      storage: localStorage
    }
  }
)
```

## 六、生产构建

### 1. 构建项目

```bash
npm run build
```

构建产物将生成在 `dist/` 目录。

### 2. 预览构建结果

```bash
npm run preview
```

### 3. 部署到服务器

将 `dist/` 目录的内容部署到Web服务器（如Nginx、Apache）。

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /java/api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 七、常见问题

### 1. npm install失败

**问题**: 网络问题导致依赖安装失败

**解决方案**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 清除缓存
npm cache clean --force

# 重新安装
npm install
```

### 2. TypeScript类型错误

**问题**: 找不到模块或类型定义

**解决方案**:
- 确保 `src/env.d.ts` 文件存在
- 重启VSCode或TypeScript服务
- 运行 `npm run build` 检查是否有编译错误

### 3. API请求失败

**问题**: 跨域或代理配置问题

**解决方案**:
1. 检查 `vite.config.ts` 中的proxy配置
2. 确认后端服务器地址正确
3. 检查后端是否启用CORS
4. 查看浏览器控制台的网络请求详情

### 4. 登录失败

**问题**: Token未保存或接口返回错误

**解决方案**:
1. 检查localStorage中是否有 `chatna-user` 键
2. 确认用户名密码正确
3. 查看浏览器控制台的错误信息
4. 确认后端登录接口正常

## 八、API接口文档参考

完整的后端API接口文档请参考提供的PRD文档。

### 主要接口端点

- **登录**: `POST /api/backend/sysUser/login`
- **用户列表**: `POST /api/backend/user/list`
- **提现列表**: `POST /api/backend/pay/withdrawList`
- **提现审核**: `POST /api/backend/pay/approval`

### 请求格式

```typescript
// 标准请求
{
  "pageNo": 1,
  "pageSize": 10,
  // ... other params
}

// 标准响应
{
  "ec": 0,           // 0表示成功
  "data": {},        // 响应数据
  "em": "",          // 错误信息
  "traceId": "",
  "ip": "",
  "st": 1234567890
}
```

## 九、后续开发建议

### 待完善功能

1. **系统管理模块**
   - 系统用户管理
   - 角色权限管理
   - 菜单管理

2. **活动运营模块**
   - Banner配置管理
   - 礼物配置管理
   - 礼包配置管理

3. **公会运营模块**
   - 公会管理
   - 主播管理
   - 薪资管理

4. **内容运营模块**
   - 动态管理
   - 推荐位配置
   - 装扮管理

5. **优化项**
   - 添加单元测试
   - 添加E2E测试
   - 性能优化
   - 错误边界处理
   - 国际化支持

### 开发规范

1. **代码规范**
   - 使用ESLint和Prettier保持代码风格一致
   - 遵循Vue 3 Composition API最佳实践
   - 使用TypeScript严格模式

2. **提交规范**
   - feat: 新功能
   - fix: 修复bug
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 重构
   - test: 测试相关
   - chore: 构建/工具链相关

3. **分支管理**
   - main: 生产分支
   - develop: 开发分支
   - feature/*: 功能分支
   - hotfix/*: 紧急修复分支

## 十、技术支持

如有问题，请联系开发团队或提交Issue。

---

**最后更新**: 2024-11-24
**文档版本**: 1.0.0
