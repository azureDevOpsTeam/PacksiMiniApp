# حل مشکل 404 Not Found - bot.draton.io

## وضعیت فعلی
✅ CI/CD Pipeline موفقیت‌آمیز  
❌ سایت https://bot.draton.io/ خطای 404 می‌دهد  
✅ Nginx نصب و فعال است (nginx/1.18.0)

## علل احتمالی مشکل 404

### 1. عدم تنظیم Virtual Host برای دامنه
### 2. فایل‌های اپلیکیشن در مسیر اشتباه
### 3. مشکل در تنظیمات DNS
### 4. عدم reload کردن Nginx پس از تغییرات

---

## مراحل حل مشکل

### مرحله 1: بررسی Virtual Host

```bash
# بررسی فایل‌های تنظیمات Nginx
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/

# بررسی محتوای فایل تنظیمات (اگر وجود دارد)
sudo cat /etc/nginx/sites-available/tg-app
sudo cat /etc/nginx/sites-available/bot.draton.io
```

**اگر فایل تنظیمات وجود ندارد:**

```bash
# ایجاد فایل تنظیمات
sudo nano /etc/nginx/sites-available/bot.draton.io
```

**محتوای فایل:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bot.draton.io;
    
    root /var/www/tg-app/dist;
    index index.html;
    
    # برای React SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # فایل‌های استاتیک
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # لاگ‌ها
    access_log /var/log/nginx/bot.draton.io.access.log;
    error_log /var/log/nginx/bot.draton.io.error.log;
}
```

**فعال‌سازی Virtual Host:**
```bash
# ایجاد symlink
sudo ln -s /etc/nginx/sites-available/bot.draton.io /etc/nginx/sites-enabled/

# حذف default site (اختیاری)
sudo rm /etc/nginx/sites-enabled/default

# تست تنظیمات
sudo nginx -t

# reload کردن Nginx
sudo systemctl reload nginx
```

### مرحله 2: بررسی فایل‌های اپلیکیشن

```bash
# بررسی وجود دایرکتوری
ls -la /var/www/tg-app/

# بررسی فایل‌های dist
ls -la /var/www/tg-app/dist/

# بررسی index.html
cat /var/www/tg-app/dist/index.html

# بررسی مالکیت و دسترسی‌ها
sudo chown -R www-data:www-data /var/www/tg-app/
sudo chmod -R 755 /var/www/tg-app/
```

### مرحله 3: بررسی DNS و دامنه

```bash
# بررسی DNS resolution
nslookup bot.draton.io
dig bot.draton.io

# تست اتصال محلی
curl -I http://localhost
curl -I http://bot.draton.io
```

### مرحله 4: بررسی لاگ‌های Nginx

```bash
# بررسی لاگ خطا
sudo tail -f /var/log/nginx/error.log

# بررسی لاگ دسترسی
sudo tail -f /var/log/nginx/access.log

# لاگ‌های مخصوص سایت (اگر تنظیم شده)
sudo tail -f /var/log/nginx/bot.draton.io.error.log
```

### مرحله 5: تست و عیب‌یابی

```bash
# تست از داخل سرور
curl -H "Host: bot.draton.io" http://localhost/

# بررسی وضعیت Nginx
sudo systemctl status nginx

# restart کردن Nginx
sudo systemctl restart nginx
```

---

## اسکریپت خودکار تشخیص مشکل

```bash
#!/bin/bash
echo "=== تشخیص مشکل 404 ==="

echo "1. بررسی Virtual Hosts:"
sudo ls -la /etc/nginx/sites-enabled/

echo "\n2. بررسی فایل‌های اپلیکیشن:"
ls -la /var/www/tg-app/dist/ 2>/dev/null || echo "❌ دایرکتوری dist وجود ندارد"

echo "\n3. تست تنظیمات Nginx:"
sudo nginx -t

echo "\n4. بررسی DNS:"
nslookup bot.draton.io

echo "\n5. تست اتصال محلی:"
curl -I http://localhost 2>/dev/null || echo "❌ اتصال محلی ناموفق"

echo "\n6. آخرین خطاهای Nginx:"
sudo tail -5 /var/log/nginx/error.log
```

---

## راه‌حل‌های سریع

### اگر Virtual Host وجود ندارد:
```bash
# کپی کردن تنظیمات از فایل موجود در پروژه
sudo cp /var/www/tg-app/nginx.conf /etc/nginx/sites-available/bot.draton.io
sudo ln -s /etc/nginx/sites-available/bot.draton.io /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### اگر فایل‌ها وجود ندارند:
```bash
# اجرای مجدد deployment
cd /var/www/tg-app
sudo git pull origin main
sudo npm ci
sudo npm run build
sudo chown -R www-data:www-data dist/
```

### اگر DNS مشکل دارد:
```bash
# تست با IP مستقیم
curl -H "Host: bot.draton.io" http://[SERVER_IP]/
```

---

## تست نهایی

پس از اعمال تغییرات:

1. ✅ `sudo nginx -t` (بدون خطا)
2. ✅ `sudo systemctl reload nginx`
3. ✅ `curl -I http://bot.draton.io` (کد 200)
4. ✅ بازدید از https://bot.draton.io در مرورگر

## کمک اضافی

اگر مشکل همچنان ادامه دارد:
- اسکریپت `verify-deployment.sh` را اجرا کنید
- فایل `TROUBLESHOOTING.md` را مطالعه کنید
- لاگ‌های کامل GitHub Actions را بررسی کنید