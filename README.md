# Chatna运营管理后台系统

基于Vue 3 + TypeScript + Ant Design Vue的现代化B端运营管理系统

## ✨ 特性

- 🚀 **Vue 3** - 使用最新的Vue 3 Composition API
- 💪 **TypeScript** - 完整的类型支持
- 🎨 **Ant Design Vue** - 企业级UI设计语言
- 📦 **Vite** - 极速的开发体验
- 🔐 **JWT认证** - 完整的用户认证和路由守卫
- 💾 **Pinia** - 现代化的状态管理，支持持久化
- 📱 **响应式布局** - 适配各种屏幕尺寸
- 🔧 **模块化架构** - 清晰的代码组织结构

## 📦 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd claudePlatform

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 📚 文档

详细的部署和使用文档请参见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🏗️ 项目结构

```
src/
├── api/              # API接口层
├── assets/           # 静态资源
├── components/       # 通用组件
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 🎯 核心功能

### 已实现功能

- ✅ 用户登录认证
- ✅ 用户信息管理
  - 用户列表查询
  - 用户详情查看
  - 下发钻石/金币
  - 用户封禁管理
  - 流水记录查询
- ✅ 提现审核管理
  - 提现订单列表
  - 单个/批量审核
  - 审核统计

### 待实现功能

- ⏳ 系统管理（用户、角色、菜单）
- ⏳ 活动运营（Banner、礼物、礼包）
- ⏳ 公会运营（公会、主播、薪资）
- ⏳ 内容运营（动态、推荐、装扮）

## 🔧 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式JavaScript框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Ant Design Vue](https://antdv.com/) - 企业级UI组件库
- [Pinia](https://pinia.vuejs.org/) - Vue状态管理
- [Vue Router](https://router.vuejs.org/) - Vue路由管理
- [Axios](https://axios-http.com/) - HTTP客户端
- [Day.js](https://day.js.org/) - 日期处理库

## 📝 开发规范

### 代码风格

项目使用ESLint和Prettier保持代码风格一致。

### Git提交规范

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 📄 许可证

[MIT](LICENSE)

## 👥 贡献

欢迎提交Issue和Pull Request!

---

**最后更新**: 2024-11-24