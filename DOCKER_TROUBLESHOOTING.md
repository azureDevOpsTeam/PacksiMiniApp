# Docker Container Troubleshooting Guide

## مشکل: Docker Container راه‌اندازی نمی‌شود

### علائم:
- `❌ Docker container is not running`
- خطای `Process exited with status 1`
- هشدار `version attribute is obsolete` (حل شده)

### مراحل عیب‌یابی:

#### 1. بررسی وضعیت کانتینر
```bash
cd /var/www/tg-app
docker-compose ps
docker-compose logs app-prod
```

#### 2. بررسی فرآیند build
```bash
# حذف کانتینرهای قدیمی
docker-compose down
docker system prune -f

# build مجدد با جزئیات
docker-compose build --no-cache app-prod
docker-compose up app-prod
```

#### 3. بررسی منابع سیستم
```bash
# بررسی فضای دیسک
df -h

# بررسی حافظه
free -h

# بررسی فرآیندهای Docker
docker ps -a
docker images
```

#### 4. بررسی فایل‌های پروژه
```bash
# بررسی وجود فایل‌های ضروری
ls -la /var/www/tg-app/
ls -la /var/www/tg-app/dist/ 2>/dev/null || echo "dist directory missing"
cat /var/www/tg-app/package.json | grep scripts
```

#### 5. تست build محلی
```bash
cd /var/www/tg-app

# نصب dependencies
npm ci

# تست build
npm run build

# بررسی خروجی
ls -la dist/
```

### راه‌حل‌های متداول:

#### مشکل 1: Dependencies نصب نشده
```bash
cd /var/www/tg-app
npm ci
npm run build
docker-compose up --build app-prod
```

#### مشکل 2: کمبود فضای دیسک
```bash
# پاک‌سازی Docker
docker system prune -a -f
docker volume prune -f

# پاک‌سازی node_modules
rm -rf node_modules
npm ci
```

#### مشکل 3: مشکل در nginx.conf
```bash
# تست تنظیمات nginx
nginx -t -c /var/www/tg-app/nginx.conf

# اگر خطا داشت، از تنظیمات پیش‌فرض استفاده کنید
cp /etc/nginx/conf.d/default.conf.backup /var/www/tg-app/nginx.conf
```

#### مشکل 4: مجوزهای فایل
```bash
sudo chown -R $USER:$USER /var/www/tg-app
sudo chmod -R 755 /var/www/tg-app
```

### اجرای مرحله‌ای:

```bash
# مرحله 1: توقف همه چیز
sudo systemctl stop tg.service
docker-compose down

# مرحله 2: پاک‌سازی
docker system prune -f
rm -rf node_modules dist

# مرحله 3: نصب و build
npm ci
npm run build

# مرحله 4: تست Docker
docker-compose build --no-cache app-prod
docker-compose up app-prod

# مرحله 5: اگر موفق بود، راه‌اندازی service
sudo systemctl start tg.service
```

### لاگ‌های مفید:

```bash
# لاگ‌های Docker
docker-compose logs --tail=50 app-prod

# لاگ‌های systemd
sudo journalctl -u tg.service -f

# لاگ‌های nginx
sudo tail -f /var/log/nginx/error.log
```

### تماس با پشتیبانی:

اگر مشکل حل نشد، این اطلاعات را ارسال کنید:

```bash
# جمع‌آوری اطلاعات سیستم
echo "=== System Info ==="
uname -a
docker --version
docker-compose --version
node --version
npm --version

echo "=== Disk Space ==="
df -h

echo "=== Memory ==="
free -h

echo "=== Docker Status ==="
docker ps -a
docker images

echo "=== Project Files ==="
ls -la /var/www/tg-app/

echo "=== Build Logs ==="
docker-compose logs app-prod
```