# راهنمای استقرار Packsi Mini App

این راهنما مراحل کامل راه‌اندازی پروژه Telegram Mini App روی سرور VPS جدید را شرح می‌دهد.

## پیش‌نیازها

### متغیرهای محیطی GitHub
در بخش Settings > Secrets and variables > Actions پروژه GitHub خود، متغیرهای زیر را تنظیم کنید:

```
APP_URL=https://your-domain.com
SERVER_HOST=your-server-ip
SERVER_PORT=22
SERVER_SSH_KEY=your-private-ssh-key
SERVER_USER=your-username
APP_DIRECTORY=/var/www/tg-app (اختیاری)
```

### سرور VPS
- سیستم عامل: Ubuntu 20.04+ یا Debian 11+
- RAM: حداقل 1GB
- فضای ذخیره: حداقل 10GB
- دسترسی SSH با کلید خصوصی
- دسترسی sudo برای کاربر

## مراحل راه‌اندازی

### 1. راه‌اندازی اولیه سرور

ابتدا به سرور خود متصل شوید:

```bash
ssh your-username@your-server-ip
```

سپس اسکریپت راه‌اندازی را اجرا کنید:

```bash
# دانلود پروژه
git clone https://github.com/your-username/PacksiMiniApp.git /var/www/tg-app
cd /var/www/tg-app

# اجرای اسکریپت راه‌اندازی
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2. تنظیم SSL Certificate (اختیاری)

اگر دامنه دارید، SSL certificate تنظیم کنید:

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. راه‌اندازی سرویس

```bash
# کپی فایل سرویس
sudo cp tg.service /etc/systemd/system/
sudo systemctl daemon-reload

# فعال‌سازی و شروع سرویس
sudo systemctl enable tg.service
sudo systemctl start tg.service

# بررسی وضعیت
sudo systemctl status tg.service
```

### 4. تست اولیه

```bash
# بررسی وضعیت کانتینر
docker-compose ps

# تست اتصال محلی
curl http://localhost/

# مشاهده لاگ‌ها
docker-compose logs app-prod
```

## استقرار خودکار

پس از راه‌اندازی اولیه، هر بار که کد را به branch `main` push کنید، فرآیند CI/CD به صورت خودکار:

1. کد را تست می‌کند
2. پروژه را build می‌کند
3. فایل‌ها را به سرور کپی می‌کند
4. کانتینر Docker را rebuild و restart می‌کند
5. تست‌های سلامت را انجام می‌دهد

## فایل‌های مهم

### `tg.service`
فایل systemd service برای مدیریت خودکار کانتینر Docker

### `scripts/setup-server.sh`
اسکریپت راه‌اندازی اولیه سرور که تمام وابستگی‌ها را نصب می‌کند

### `scripts/deploy.sh`
اسکریپت deployment که در CI/CD استفاده می‌شود

### `docker-compose.yml`
تنظیمات Docker Compose برای محیط production

### `Dockerfile`
تنظیمات ساخت image Docker

### `nginx.conf`
تنظیمات Nginx برای serve کردن فایل‌های static

## دستورات مفید

### مدیریت سرویس
```bash
# شروع سرویس
sudo systemctl start tg.service

# توقف سرویس
sudo systemctl stop tg.service

# restart سرویس
sudo systemctl restart tg.service

# مشاهده وضعیت
sudo systemctl status tg.service

# مشاهده لاگ‌ها
sudo journalctl -u tg.service -f
```

### مدیریت Docker
```bash
# مشاهده کانتینرهای در حال اجرا
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs app-prod

# rebuild کانتینر
docker-compose build --no-cache app-prod
docker-compose up -d app-prod

# پاک‌سازی
docker system prune -f
```

### مدیریت Nginx
```bash
# تست تنظیمات
sudo nginx -t

# reload تنظیمات
sudo systemctl reload nginx

# مشاهده لاگ‌ها
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## عیب‌یابی

### کانتینر شروع نمی‌شود
```bash
# مشاهده لاگ‌های دقیق
docker-compose logs app-prod

# بررسی فضای دیسک
df -h

# بررسی منابع سیستم
free -h
top
```

### سایت در دسترس نیست
```bash
# بررسی وضعیت Nginx
sudo systemctl status nginx

# بررسی پورت‌ها
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# بررسی فایروال
sudo ufw status
```

### مشکلات SSL
```bash
# بررسی certificate
sudo certbot certificates

# تجدید certificate
sudo certbot renew --dry-run
```

## پشتیبان‌گیری

سیستم به صورت خودکار از deployment قبلی backup می‌گیرد. فایل‌های backup در مسیر `/var/www/tg-app/backups/` ذخیره می‌شوند.

### بازگردانی از backup
```bash
cd /var/www/tg-app
sudo systemctl stop tg.service
tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz
sudo systemctl start tg.service
```

## امنیت

- فایروال UFW فعال است و فقط پورت‌های ضروری باز هستند
- Fail2ban برای محافظت در برابر حملات brute force نصب شده
- SSL certificate برای رمزنگاری ترافیک
- Security headers در Nginx تنظیم شده
- کانتینر Docker با کمترین دسترسی‌ها اجرا می‌شود

## پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های سیستم را بررسی کنید
2. وضعیت سرویس‌ها را چک کنید
3. فضای دیسک و منابع سیستم را بررسی کنید
4. در صورت نیاز از backup استفاده کنید