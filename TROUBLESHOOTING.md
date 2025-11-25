# 问题排查和解决方案

## 当前遇到的问题

### 1. 登录失败 - 500错误

**问题原因：**
- 代理配置中使用了占位符地址 `http://your-backend-server.com`
- 需要配置为实际的后端服务器地址

**已修复：**
✅ 已将 `vite.config.ts` 中的代理目标修改为 `https://similar-dev.zykjnow.com`

### 2. 缺少依赖

**问题原因：**
- 数据看板页面需要 echarts 依赖

**已修复：**
✅ 已在 `package.json` 中添加 `echarts: ^5.4.3`

## 解决步骤

### 步骤1: 重新安装依赖

```bash
# 删除现有的 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install
```

### 步骤2: 重启开发服务器

```bash
# 停止当前运行的服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 步骤3: 清除浏览器缓存

1. 打开浏览器开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 步骤4: 尝试登录

使用以下凭据登录：
- 用户名: `tyym`
- 密码: `Aihh1314*`

## 如果仍然无法登录

### 检查1: 确认后端服务是否正常

在浏览器中访问：
```
https://similar-dev.zykjnow.com/halla-operation-manager-platform/
```

确认原始后台系统是否可以访问。

### 检查2: 查看网络请求

1. 打开浏览器开发者工具
2. 切换到 Network 标签页
3. 点击登录按钮
4. 查看登录请求的响应

**预期请求：**
- URL: `http://localhost:3000/java/api/api/backend/sysUser/login`
- 代理到: `https://similar-dev.zykjnow.com/java/api/api/backend/sysUser/login`
- Method: POST
- Status: 200 (成功)

### 检查3: CORS问题

如果出现CORS错误，可能需要后端配置允许跨域访问。

**临时解决方案：**

1. 使用Chrome浏览器并安装CORS插件
2. 或者在 `vite.config.ts` 中添加更多代理配置

### 检查4: API路径是否正确

如果登录接口路径与实际后端不同，需要修改 `src/api/auth.ts` 中的URL。

**当前登录接口：**
```typescript
url: '/api/backend/sysUser/login'
```

完整路径会是：
```
/java/api/api/backend/sysUser/login
```

## 常见错误及解决方案

### 错误1: net::ERR_FILE_NOT_FOUND

**原因：** 静态资源路径错误或文件不存在

**解决：**
```bash
npm run build
npm run preview
```

### 错误2: Cannot access contents of the page

**原因：** 浏览器扩展干扰

**解决：** 在隐身模式下测试或禁用浏览器扩展

### 错误3: Connection refused

**原因：** 后端服务未启动或地址不正确

**解决：** 确认后端服务地址和状态

## 配置说明

### vite.config.ts 代理配置

```typescript
server: {
  port: 3000,
  proxy: {
    '/java/api': {
      target: 'https://similar-dev.zykjnow.com', // 后端服务器地址
      changeOrigin: true,  // 修改请求头中的origin
      secure: false,       // 接受https证书
      rewrite: (path) => path.replace(/^\/java\/api/, '/java/api')
    }
  }
}
```

### 请求流程

```
前端请求: /java/api/api/backend/sysUser/login
    ↓
Vite代理匹配: /java/api
    ↓
代理转发到: https://similar-dev.zykjnow.com/java/api/api/backend/sysUser/login
    ↓
后端处理并返回
```

## 开发建议

1. **开发环境使用代理**
   - 优点：避免CORS问题
   - 缺点：需要配置

2. **生产环境使用相对路径**
   - 前后端部署在同一域名下
   - 或配置Nginx反向代理

3. **测试环境使用Mock数据**
   - 不依赖后端服务
   - 快速开发和测试

## 联系支持

如果问题仍未解决，请提供以下信息：
1. 浏览器控制台完整错误信息
2. Network标签中的请求详情
3. 后端服务状态
