#!/bin/bash

# Chatna 运营管理后台 - 自动化部署脚本
# 适用于阿里云服务器 (CentOS/Ubuntu)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置参数（请根据实际情况修改）
PROJECT_NAME="chatna-admin"
PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"
NGINX_CONF="/etc/nginx/conf.d/${PROJECT_NAME}.conf"
BACKEND_API_URL="http://localhost:8080"  # 后端API地址
DOMAIN="your-domain.com"  # 你的域名

# 打印消息函数
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        print_message "检测到操作系统: $OS"
    else
        print_error "无法检测操作系统"
        exit 1
    fi
}

# 安装 Node.js
install_nodejs() {
    print_message "检查 Node.js 安装状态..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_message "Node.js 已安装: $NODE_VERSION"
        return
    fi

    print_message "安装 Node.js 18.x LTS..."

    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    else
        print_error "不支持的操作系统: $OS"
        exit 1
    fi

    print_message "Node.js 安装完成: $(node -v)"
    print_message "npm 版本: $(npm -v)"
}

# 安装 Nginx
install_nginx() {
    print_message "检查 Nginx 安装状态..."

    if command -v nginx &> /dev/null; then
        print_message "Nginx 已安装: $(nginx -v 2>&1)"
        return
    fi

    print_message "安装 Nginx..."

    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update
        apt-get install -y nginx
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y epel-release
        yum install -y nginx
    fi

    systemctl enable nginx
    print_message "Nginx 安装完成"
}

# 创建项目目录
create_project_dir() {
    print_message "创建项目目录: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
}

# 构建项目
build_project() {
    print_message "开始构建项目..."

    # 安装依赖
    print_message "安装 npm 依赖..."
    npm install --production=false

    # 构建项目
    print_message "执行构建..."
    npm run build

    if [ ! -d "dist" ]; then
        print_error "构建失败: dist 目录不存在"
        exit 1
    fi

    print_message "构建完成"
}

# 部署文件
deploy_files() {
    print_message "部署文件到 $PROJECT_DIR"

    # 备份旧版本
    if [ -d "$PROJECT_DIR/dist" ]; then
        BACKUP_DIR="$PROJECT_DIR/backup_$(date +%Y%m%d_%H%M%S)"
        print_message "备份旧版本到: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        mv "$PROJECT_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    fi

    # 复制新文件
    cp -r dist/* "$PROJECT_DIR/"

    print_message "文件部署完成"
}

# 配置 Nginx
configure_nginx() {
    print_message "配置 Nginx..."

    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    root ${PROJECT_DIR};
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # 前端路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass ${BACKEND_API_URL};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
EOF

    # 测试 Nginx 配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx

    print_message "Nginx 配置完成并已重启"
}

# 设置防火墙
configure_firewall() {
    print_message "配置防火墙..."

    if command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_message "防火墙已配置 (firewalld)"
    elif command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        print_message "防火墙已配置 (ufw)"
    else
        print_warning "未检测到防火墙工具，请手动开放 80 和 443 端口"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "================================"
    print_message "部署完成！"
    echo "================================"
    echo ""
    echo "项目目录: $PROJECT_DIR"
    echo "Nginx配置: $NGINX_CONF"
    echo "访问地址: http://${DOMAIN}"
    echo ""
    print_warning "请确保:"
    echo "  1. DNS已解析到本服务器"
    echo "  2. 后端API服务正常运行: $BACKEND_API_URL"
    echo "  3. 防火墙已开放 80 和 443 端口"
    echo ""
    print_message "查看 Nginx 日志:"
    echo "  tail -f /var/log/nginx/access.log"
    echo "  tail -f /var/log/nginx/error.log"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "================================"
    echo "  Chatna 运营管理后台部署脚本"
    echo "================================"
    echo ""

    check_root
    detect_os
    install_nodejs
    install_nginx
    create_project_dir
    build_project
    deploy_files
    configure_nginx
    configure_firewall
    show_deployment_info
}

# 运行主函数
main
