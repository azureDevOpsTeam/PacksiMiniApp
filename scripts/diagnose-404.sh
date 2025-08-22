#!/bin/bash

# اسکریپت تشخیص مشکل 404 برای tg.packsi.net
# استفاده: ./diagnose-404.sh

set -e

echo "🔍 تشخیص مشکل 404 برای tg.packsi.net"
echo "==========================================="

# متغیرها
APP_DIR="/var/www/tg-app"
DOMAIN="tg.packsi.net"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo "\n1️⃣ بررسی دایرکتوری اپلیکیشن"
echo "--------------------------------"
if [ -d "$APP_DIR" ]; then
    print_status 0 "دایرکتوری اپلیکیشن وجود دارد: $APP_DIR"
    
    if [ -d "$APP_DIR/dist" ]; then
        print_status 0 "دایرکتوری dist وجود دارد"
        
        if [ -f "$APP_DIR/dist/index.html" ]; then
            print_status 0 "فایل index.html وجود دارد"
            echo "📁 محتوای dist:"
            ls -la "$APP_DIR/dist/" | head -10
        else
            print_status 1 "فایل index.html وجود ندارد"
            print_warning "نیاز به build کردن اپلیکیشن"
        fi
    else
        print_status 1 "دایرکتوری dist وجود ندارد"
        print_warning "نیاز به build کردن اپلیکیشن"
    fi
else
    print_status 1 "دایرکتوری اپلیکیشن وجود ندارد: $APP_DIR"
    print_warning "نیاز به deployment اولیه"
fi

echo "\n2️⃣ بررسی تنظیمات Nginx"
echo "---------------------------"

# بررسی وضعیت Nginx
if systemctl is-active --quiet nginx; then
    print_status 0 "Nginx فعال است"
else
    print_status 1 "Nginx فعال نیست"
    print_warning "sudo systemctl start nginx"
fi

# بررسی Virtual Host
echo "\n🔧 بررسی Virtual Hosts:"
echo "Sites Available:"
ls -la "$NGINX_SITES_AVAILABLE/" 2>/dev/null || echo "❌ دسترسی به sites-available ندارید"

echo "\nSites Enabled:"
ls -la "$NGINX_SITES_ENABLED/" 2>/dev/null || echo "❌ دسترسی به sites-enabled ندارید"

# بررسی فایل تنظیمات مخصوص دامنه
CONFIG_FILES=("$DOMAIN" "tg-app" "default")
CONFIG_FOUND=false

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$NGINX_SITES_AVAILABLE/$config" ]; then
        print_status 0 "فایل تنظیمات پیدا شد: $config"
        CONFIG_FOUND=true
        
        if [ -L "$NGINX_SITES_ENABLED/$config" ]; then
            print_status 0 "Virtual Host فعال است: $config"
        else
            print_status 1 "Virtual Host فعال نیست: $config"
            print_warning "sudo ln -s $NGINX_SITES_AVAILABLE/$config $NGINX_SITES_ENABLED/"
        fi
        
        echo "\n📄 محتوای فایل تنظیمات:"
        sudo cat "$NGINX_SITES_AVAILABLE/$config" | grep -E "server_name|root|listen" || true
        break
    fi
done

if [ "$CONFIG_FOUND" = false ]; then
    print_status 1 "هیچ فایل تنظیمات مناسبی پیدا نشد"
    print_warning "نیاز به ایجاد Virtual Host برای $DOMAIN"
fi

# تست تنظیمات Nginx
echo "\n🧪 تست تنظیمات Nginx:"
if sudo nginx -t 2>/dev/null; then
    print_status 0 "تنظیمات Nginx صحیح است"
else
    print_status 1 "تنظیمات Nginx خطا دارد"
    echo "خطاهای Nginx:"
    sudo nginx -t
fi

echo "\n3️⃣ بررسی DNS و شبکه"
echo "------------------------"

# بررسی DNS
echo "🌐 تست DNS Resolution:"
if nslookup "$DOMAIN" >/dev/null 2>&1; then
    print_status 0 "DNS Resolution موفق"
    echo "IP Address:"
    nslookup "$DOMAIN" | grep -A1 "Name:" || true
else
    print_status 1 "DNS Resolution ناموفق"
    print_warning "مشکل در تنظیمات DNS یا دامنه"
fi

# تست اتصال محلی
echo "\n🔗 تست اتصال محلی:"
if curl -s -I http://localhost/ >/dev/null 2>&1; then
    print_status 0 "اتصال محلی موفق"
    echo "Response Headers:"
    curl -s -I http://localhost/ | head -3
else
    print_status 1 "اتصال محلی ناموفق"
fi

# تست اتصال با Host header
echo "\n🎯 تست با Host Header:"
if curl -s -I -H "Host: $DOMAIN" http://localhost/ >/dev/null 2>&1; then
    print_status 0 "اتصال با Host Header موفق"
    echo "Response:"
    curl -s -I -H "Host: $DOMAIN" http://localhost/ | head -3
else
    print_status 1 "اتصال با Host Header ناموفق"
fi

echo "\n4️⃣ بررسی لاگ‌ها"
echo "------------------"

echo "📋 آخرین خطاهای Nginx:"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "❌ دسترسی به لاگ خطا ندارید"

echo "\n📋 آخرین درخواست‌ها:"
sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo "❌ دسترسی به لاگ دسترسی ندارید"

echo "\n5️⃣ راه‌حل‌های پیشنهادی"
echo "=========================="

echo "\n🔧 دستورات حل مشکل:"

if [ ! -f "$APP_DIR/dist/index.html" ]; then
    echo "\n📦 Build کردن اپلیکیشن:"
    echo "cd $APP_DIR"
    echo "sudo npm ci"
    echo "sudo npm run build"
    echo "sudo chown -R www-data:www-data dist/"
fi

if [ "$CONFIG_FOUND" = false ]; then
    echo "\n⚙️ ایجاد Virtual Host:"
    echo "sudo tee $NGINX_SITES_AVAILABLE/$DOMAIN > /dev/null <<EOF"
    echo "server {"
    echo "    listen 80;"
    echo "    server_name $DOMAIN;"
    echo "    root $APP_DIR/dist;"
    echo "    index index.html;"
    echo "    location / {"
    echo "        try_files \$uri \$uri/ /index.html;"
    echo "    }"
    echo "}"
    echo "EOF"
    echo "sudo ln -s $NGINX_SITES_AVAILABLE/$DOMAIN $NGINX_SITES_ENABLED/"
    echo "sudo nginx -t && sudo systemctl reload nginx"
fi

echo "\n🔄 Reload کردن Nginx:"
echo "sudo systemctl reload nginx"

echo "\n✅ تست نهایی:"
echo "curl -I http://$DOMAIN/"
echo "یا بازدید از https://$DOMAIN در مرورگر"

echo "\n==========================================="
echo "🏁 تشخیص مشکل تمام شد"
echo "برای کمک بیشتر: NGINX_404_FIX.md را مطالعه کنید"