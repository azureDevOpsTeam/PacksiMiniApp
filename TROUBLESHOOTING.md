# راهنمای عیب‌یابی استقرار (Deployment Troubleshooting)

## مشکل فعلی: خطای 404 در Health Check

اگر deployment با خطای زیر مواجه شده:
```
curl: (22) The requested URL returned error: 404
Error: Process completed with exit code 1.
❌ Deployment failed!
```

## مراحل عیب‌یابی

### 1. بررسی GitHub Secrets

ابتدا مطمئن شوید که تمام secrets مورد نیاز در GitHub تنظیم شده‌اند:

- `SERVER_HOST`: آدرس سرور (مثال: `your-server-ip`)
- `SERVER_USER`: کاربر deployment (مثال: `deployment`)
- `SERVER_SSH_KEY`: کلید خصوصی SSH
- `SERVER_PORT`: پورت SSH (معمولاً `22`)
- `APP_DIRECTORY`: مسیر اپلیکیشن (مثال: `/var/www/tg-app`)
- `APP_URL`: آدرس نهایی اپلیکیشن (مثال: `https://bot.draton.io`)

### 2. بررسی دسترسی به سرور

از طریق SSH به سرور متصل شوید و موارد زیر را بررسی کنید:

```bash
# اتصال به سرور
ssh deployment@your-server-ip

# بررسی وجود دایرکتوری اپلیکیشن
ls -la /var/www/tg-app/

# بررسی محتویات dist
ls -la /var/www/tg-app/dist/

# بررسی وضعیت Nginx
sudo systemctl status nginx

# بررسی تنظیمات Nginx
sudo nginx -t
```

### 3. بررسی تنظیمات Nginx

مطمئن شوید که فایل تنظیمات Nginx درست است:

```bash
# بررسی فایل تنظیمات
sudo cat /etc/nginx/sites-available/tg-app

# بررسی لینک symbolic
ls -la /etc/nginx/sites-enabled/ | grep packsi
```

### 4. بررسی لاگ‌های Nginx

```bash
# بررسی لاگ‌های خطا
sudo tail -f /var/log/nginx/error.log

# بررسی لاگ‌های دسترسی
sudo tail -f /var/log/nginx/access.log
```

### 5. تست دستی Health Check

از داخل سرور، health check را دستی تست کنید:

```bash
# تست local
curl -I http://localhost/

# تست با domain
curl -I https://bot.draton.io/

# بررسی DNS
nslookup bot.draton.io
```

## راه‌حل‌های احتمالی

### اگر فایل‌ها در سرور موجود نیستند:

```bash
# بررسی مجوزها
sudo chown -R www-data:www-data /var/www/tg-app/dist/
sudo chmod -R 755 /var/www/tg-app/dist/
```

### اگر Nginx کار نمی‌کند:

```bash
# راه‌اندازی مجدد Nginx
sudo systemctl restart nginx

# بررسی وضعیت
sudo systemctl status nginx
```

### اگر SSL مشکل دارد:

```bash
# بررسی گواهی SSL
sudo certbot certificates

# تجدید گواهی
sudo certbot renew --dry-run
```

### اگر DNS مشکل دارد:

1. مطمئن شوید که domain به IP سرور اشاره می‌کند
2. منتظر propagation DNS باشید (تا 24 ساعت)
3. از ابزارهای آنلاین DNS checker استفاده کنید

## تست موقت بدون SSL

برای تست سریع، می‌توانید health check را موقتاً به HTTP تغییر دهید:

1. در فایل `.github/workflows/ci-cd.yml` خط health check را تغییر دهید:
```yaml
- name: Health check
  run: |
    sleep 10
    curl -f http://bot.draton.io || curl -f ${{ secrets.APP_URL }} || exit 1
```

## اقدامات پیشگیرانه

1. **مانیتورینگ مداوم**: از ابزارهای مانیتورینگ مثل UptimeRobot استفاده کنید
2. **بک‌آپ منظم**: اطمینان حاصل کنید که بک‌آپ‌ها به درستی ایجاد می‌شوند
3. **تست staging**: قبل از production، در محیط staging تست کنید
4. **لاگ مانیتورینگ**: به طور منظم لاگ‌ها را بررسی کنید

## تماس برای پشتیبانی

اگر مشکل همچنان ادامه دارد:
1. لاگ‌های کامل GitHub Actions را ذخیره کنید
2. لاگ‌های سرور را جمع‌آوری کنید
3. تنظیمات DNS و SSL را بررسی کنید
4. با تیم DevOps تماس بگیرید