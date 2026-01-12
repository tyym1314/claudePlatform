# Chatna 运营管理后台 - 阿里云部署指南

本指南详细说明如何将项目部署到阿里云服务器。

## 📋 目录

- [服务器准备](#服务器准备)
- [方式一：自动化脚本部署](#方式一自动化脚本部署推荐)
- [方式二：Docker 部署](#方式二docker-部署)
- [方式三：手动部署](#方式三手动部署)
- [配置 HTTPS](#配置-https)
- [常见问题](#常见问题)

---

## 服务器准备

### 1. 购买阿里云ECS实例

推荐配置：
- **规格**: 2核4G或更高
- **操作系统**: CentOS 7.x / Ubuntu 20.04 LTS
- **带宽**: 5M 或更高
- **存储**: 40GB 系统盘

### 2. 配置安全组规则

在阿里云控制台 > ECS > 安全组中添加以下规则：

| 规则方向 | 协议类型 | 端口范围 | 授权对象 | 说明 |
|---------|---------|---------|---------|------|
| 入方向 | TCP | 22 | 你的IP/0.0.0.0/0 | SSH |
| 入方向 | TCP | 80 | 0.0.0.0/0 | HTTP |
| 入方向 | TCP | 443 | 0.0.0.0/0 | HTTPS |

### 3. 连接到服务器

```bash
ssh root@your-server-ip
```

---

## 方式一：自动化脚本部署（推荐）

### 步骤 1: 上传代码到服务器

```bash
# 在本地电脑上，将代码上传到服务器
scp -r /path/to/claudePlatform root@your-server-ip:/root/

# 或使用 Git 克隆
ssh root@your-server-ip
cd /root
git clone <your-repository-url> claudePlatform
cd claudePlatform
```

### 步骤 2: 配置部署参数

编辑 `deploy.sh`，修改以下配置：

```bash
vi deploy.sh

# 修改这些变量:
PROJECT_NAME="chatna-admin"
PROJECT_DIR="/www/wwwroot/chatna-admin"
BACKEND_API_URL="http://localhost:8080"  # 你的后端API地址
DOMAIN="your-domain.com"  # 你的域名
```

### 步骤 3: 运行部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
- ✅ 安装 Node.js 和 Nginx
- ✅ 构建项目
- ✅ 部署文件
- ✅ 配置 Nginx
- ✅ 配置防火墙

### 步骤 4: 验证部署

访问: `http://your-server-ip` 或 `http://your-domain.com`

---

## 方式二：Docker 部署

### 步骤 1: 安装 Docker

```bash
# CentOS
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ubuntu
apt-get update
apt-get install -y docker.io docker-compose

# 启动 Docker
systemctl start docker
systemctl enable docker
```

### 步骤 2: 上传代码

```bash
# 使用 Git
git clone <your-repository-url> /root/claudePlatform
cd /root/claudePlatform
```

### 步骤 3: 配置环境变量

编辑 `docker-compose.yml`，修改后端API地址：

```yaml
environment:
  - BACKEND_API_URL=http://your-backend-server:8080
```

### 步骤 4: 构建并启动容器

```bash
# 构建镜像
docker build -t chatna-admin:latest .

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 步骤 5: 验证部署

```bash
# 检查容器状态
docker-compose ps

# 访问应用
curl http://localhost
```

### Docker 常用命令

```bash
# 停止容器
docker-compose down

# 重启容器
docker-compose restart

# 查看日志
docker-compose logs -f chatna-admin

# 重新构建并启动
docker-compose up -d --build
```

---

## 方式三：手动部署

### 步骤 1: 安装 Node.js

```bash
# 安装 Node.js 18.x LTS
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -  # CentOS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -  # Ubuntu
yum install -y nodejs  # CentOS
apt-get install -y nodejs  # Ubuntu

# 验证安装
node -v
npm -v
```

### 步骤 2: 安装 Nginx

```bash
# CentOS
yum install -y epel-release
yum install -y nginx

# Ubuntu
apt-get update
apt-get install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

### 步骤 3: 上传代码并构建

```bash
# 克隆代码
cd /root
git clone <your-repository-url> claudePlatform
cd claudePlatform

# 安装依赖
npm install

# 构建项目
npm run build
```

### 步骤 4: 部署文件

```bash
# 创建项目目录
mkdir -p /www/wwwroot/chatna-admin

# 复制构建产物
cp -r dist/* /www/wwwroot/chatna-admin/

# 设置权限
chmod -R 755 /www/wwwroot/chatna-admin
```

### 步骤 5: 配置 Nginx

```bash
# 复制 Nginx 配置
cp nginx.conf /etc/nginx/conf.d/chatna-admin.conf

# 编辑配置文件，修改域名和后端API地址
vi /etc/nginx/conf.d/chatna-admin.conf

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 步骤 6: 验证部署

```bash
# 检查 Nginx 状态
systemctl status nginx

# 访问应用
curl http://localhost
```

---

## 配置 HTTPS

### 方式一：使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
yum install -y certbot python3-certbot-nginx  # CentOS
apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# 申请证书（自动配置 Nginx）
certbot --nginx -d your-domain.com

# 证书会自动续期，可以测试续期命令
certbot renew --dry-run
```

### 方式二：使用阿里云SSL证书

1. 在阿里云控制台申请免费SSL证书
2. 下载证书文件（Nginx格式）
3. 上传到服务器：

```bash
mkdir -p /etc/nginx/ssl
# 上传证书文件到 /etc/nginx/ssl/
```

4. 修改 Nginx 配置：

```bash
vi /etc/nginx/conf.d/chatna-admin.conf
```

取消注释 HTTPS 配置部分，修改证书路径：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;

    # ... 其他配置
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

5. 重启 Nginx：

```bash
nginx -t
systemctl restart nginx
```

---

## 域名配置

### 1. 在域名服务商添加 DNS 解析

添加 A 记录：
- **主机记录**: @ 或 www
- **记录类型**: A
- **记录值**: 你的服务器公网IP

### 2. 等待 DNS 生效

通常需要 10 分钟到 24 小时，可以用以下命令检查：

```bash
ping your-domain.com
nslookup your-domain.com
```

---

## 更新部署

### 使用自动化脚本更新

```bash
cd /root/claudePlatform
git pull
./deploy.sh
```

### 使用 Docker 更新

```bash
cd /root/claudePlatform
git pull
docker-compose down
docker-compose up -d --build
```

### 手动更新

```bash
cd /root/claudePlatform
git pull
npm install
npm run build
cp -r dist/* /www/wwwroot/chatna-admin/
systemctl reload nginx
```

---

## 监控和日志

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/chatna-admin-access.log

# 错误日志
tail -f /var/log/nginx/chatna-admin-error.log
```

### 系统资源监控

```bash
# CPU 和内存使用
htop
# 或
top

# 磁盘使用
df -h

# 网络连接
netstat -tunlp
```

### Docker 日志（如果使用 Docker）

```bash
docker-compose logs -f
docker logs chatna-admin
```

---

## 常见问题

### 1. 无法访问网站

**检查防火墙**:
```bash
# 检查端口是否开放
netstat -tunlp | grep 80
netstat -tunlp | grep 443

# CentOS 防火墙
firewall-cmd --list-all
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# Ubuntu 防火墙
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

**检查阿里云安全组**: 确保已添加 80 和 443 端口规则

**检查 Nginx**:
```bash
systemctl status nginx
nginx -t
journalctl -xeu nginx
```

### 2. API 请求失败

**检查后端服务**:
```bash
# 确认后端是否运行
netstat -tunlp | grep 8080
curl http://localhost:8080/api/health
```

**检查 Nginx 代理配置**:
```bash
vi /etc/nginx/conf.d/chatna-admin.conf
# 确认 proxy_pass 地址正确
```

### 3. 构建失败

**检查 Node.js 版本**:
```bash
node -v  # 应该 >= 16.0.0
```

**清除缓存重试**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**内存不足**:
```bash
# 添加 swap 空间
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 4. Docker 相关问题

**容器启动失败**:
```bash
docker-compose ps
docker-compose logs
```

**清理 Docker 资源**:
```bash
# 停止所有容器
docker-compose down

# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune
```

### 5. 性能优化

**启用 Nginx 缓存**:
```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m;
proxy_cache_key "$scheme$request_method$host$request_uri";
```

**启用 HTTP/2**:
```nginx
listen 443 ssl http2;
```

**优化 Nginx 工作进程**:
```bash
# 在 nginx.conf 顶部
worker_processes auto;
worker_connections 2048;
```

---

## 备份策略

### 自动备份脚本

创建 `/root/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/root/backups"
PROJECT_DIR="/www/wwwroot/chatna-admin"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/chatna-admin-$DATE.tar.gz $PROJECT_DIR

# 只保留最近 7 天的备份
find $BACKUP_DIR -name "chatna-admin-*.tar.gz" -mtime +7 -delete
```

添加到定时任务：

```bash
chmod +x /root/backup.sh
crontab -e

# 每天凌晨 2 点自动备份
0 2 * * * /root/backup.sh
```

---

## 安全建议

1. **修改 SSH 端口**
2. **禁用 root 密码登录，使用密钥认证**
3. **安装防火墙（firewalld 或 ufw）**
4. **定期更新系统和软件包**
5. **配置 fail2ban 防止暴力破解**
6. **使用 HTTPS 加密传输**

---

## 技术支持

如有问题，请检查：

1. **Nginx 日志**: `/var/log/nginx/`
2. **系统日志**: `journalctl -xe`
3. **Docker 日志**: `docker-compose logs`

---

**部署成功后，记得测试所有功能！**

- ✅ 登录功能
- ✅ API 请求
- ✅ 页面路由
- ✅ 静态资源加载

祝部署顺利！🎉
