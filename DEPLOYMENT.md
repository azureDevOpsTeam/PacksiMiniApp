# راهنمای استقرار (Deployment Guide)

این راهنما نحوه تنظیم CI/CD pipeline برای پروژه Packsi Mini App را توضیح می‌دهد.

## پیش‌نیازها

### 1. سرور
- سرور Linux (Ubuntu/CentOS) با دسترسی SSH
- وب سرور نصب شده (Nginx یا Apache)
- Node.js نصب شده (اختیاری برای build در سرور)

### 2. دسترسی‌ها
- دسترسی SSH به سرور
- دسترسی sudo برای کاربر deployment
- پورت‌های مورد نیاز باز باشند (22 برای SSH، 80/443 برای HTTP/HTTPS)

## تنظیم GitHub Secrets

برای استفاده از CI/CD pipeline، باید secrets زیر را در GitHub تنظیم کنید:

### مراحل تنظیم:
1. به repository خود در GitHub بروید
2. Settings > Secrets and variables > Actions
3. "New repository secret" را کلیک کنید
4. secrets زیر را اضافه کنید:

### Secrets مورد نیاز:

```
SERVER_HOST=your-server-ip-or-domain
SERVER_USER=deployment-user
SERVER_SSH_KEY=your-private-ssh-key
SERVER_PORT=22
APP_DIRECTORY=/var/www/packsi-mini-app
APP_URL=https://your-domain.com
```

### توضیح هر Secret:

- **SERVER_HOST**: آدرس IP یا دامنه سرور شما
- **SERVER_USER**: نام کاربری که برای deployment استفاده می‌شود
- **SERVER_SSH_KEY**: کلید خصوصی SSH (محتوای فایل ~/.ssh/id_rsa)
- **SERVER_PORT**: پورت SSH (معمولاً 22)
- **APP_DIRECTORY**: مسیر نصب اپلیکیشن در سرور
- **APP_URL**: آدرس نهایی اپلیکیشن برای health check

## تنظیم سرور

### 1. ایجاد کاربر deployment

```bash
# ایجاد کاربر جدید
sudo adduser deployment

# اضافه کردن به گروه sudo
sudo usermod -aG sudo deployment

# تنظیم SSH key
sudo mkdir -p /home/deployment/.ssh
sudo nano /home/deployment/.ssh/authorized_keys
# کلید عمومی SSH را اینجا قرار دهید

sudo chown -R deployment:deployment /home/deployment/.ssh
sudo chmod 700 /home/deployment/.ssh
sudo chmod 600 /home/deployment/.ssh/authorized_keys
```

### 2. ایجاد دایرکتوری اپلیکیشن

```bash
# ایجاد دایرکتوری
sudo mkdir -p /var/www/packsi-mini-app
sudo chown deployment:www-data /var/www/packsi-mini-app
sudo chmod 755 /var/www/packsi-mini-app
```

### 3. تنظیم Nginx

```nginx
# /etc/nginx/sites-available/packsi-mini-app
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/packsi-mini-app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# فعال کردن سایت
sudo ln -s /etc/nginx/sites-available/packsi-mini-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. تنظیم SSL (اختیاری)

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com
```

## نحوه کار Pipeline

### مراحل CI/CD:

1. **Test**: اجرای linting، type checking و تست‌ها
2. **Build**: ساخت اپلیکیشن و ایجاد artifact
3. **Deploy**: انتقال فایل‌ها به سرور و راه‌اندازی

### Triggers:
- Push به branch های `main` و `develop`
- Pull request به branch `main`
- Deploy فقط برای push به `main` انجام می‌شود

## مانیتورینگ و عیب‌یابی

### بررسی لاگ‌های GitHub Actions:
1. به tab "Actions" در repository بروید
2. workflow مورد نظر را انتخاب کنید
3. جزئیات هر مرحله را بررسی کنید

### بررسی لاگ‌های سرور:

```bash
# لاگ‌های Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# بررسی وضعیت سرویس‌ها
sudo systemctl status nginx
```

### مشکلات رایج:

1. **خطای SSH**: بررسی کلید SSH و دسترسی‌ها
2. **خطای permissions**: بررسی مالکیت فایل‌ها
3. **خطای build**: بررسی dependencies و scripts

## بک‌آپ و بازیابی

Pipeline به طور خودکار بک‌آپ از deployment قبلی ایجاد می‌کند:

```bash
# مشاهده بک‌آپ‌ها
ls -la /var/www/packsi-mini-app/backups/

# بازیابی از بک‌آپ
cd /var/www/packsi-mini-app
sudo tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz
```

## امنیت

- کلیدهای SSH را محرمانه نگه دارید
- دسترسی‌های کاربر deployment را محدود کنید
- به طور منظم سرور را به‌روزرسانی کنید
- از firewall استفاده کنید

## پشتیبانی

برای مشکلات فنی:
1. ابتدا لاگ‌های GitHub Actions را بررسی کنید
2. لاگ‌های سرور را چک کنید
3. تنظیمات secrets را مجدداً بررسی کنید