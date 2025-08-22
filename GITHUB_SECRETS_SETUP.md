# راهنمای تنظیم GitHub Secrets

## مشکل فعلی
اگر deployment با خطای زیر مواجه شده:
```
Both HTTPS and HTTP health checks failed
Checking if files exist on server...
Error: Process completed with exit code 1.
```

این به معنای عدم تنظیم صحیح GitHub Secrets است.

## مراحل تنظیم GitHub Secrets

### 1. دسترسی به تنظیمات Repository
1. به repository خود در GitHub بروید
2. روی **Settings** کلیک کنید
3. از منوی سمت چپ **Secrets and variables** > **Actions** را انتخاب کنید

### 2. اضافه کردن Secrets مورد نیاز

برای هر secret زیر، روی **"New repository secret"** کلیک کنید:

#### `SERVER_HOST` (ضروری)
- **Name**: `SERVER_HOST`
- **Secret**: آدرس IP یا دامنه سرور شما
- **مثال**: `192.168.1.100` یا `your-server.com`

#### `SERVER_USER` (ضروری)
- **Name**: `SERVER_USER`
- **Secret**: نام کاربری برای اتصال SSH
- **مثال**: `deployment` یا `ubuntu`

#### `SERVER_SSH_KEY` (ضروری)
- **Name**: `SERVER_SSH_KEY`
- **Secret**: کلید خصوصی SSH (محتوای کامل فایل `~/.ssh/id_rsa`)
- **نکته**: کلید باید با `-----BEGIN OPENSSH PRIVATE KEY-----` شروع شود

#### `SERVER_PORT` (اختیاری)
- **Name**: `SERVER_PORT`
- **Secret**: پورت SSH (پیش‌فرض: `22`)

#### `APP_DIRECTORY` (اختیاری)
- **Name**: `APP_DIRECTORY`
- **Secret**: مسیر نصب اپلیکیشن در سرور
- **پیش‌فرض**: `/var/www/tg-app`

#### `APP_URL` (ضروری)
- **Name**: `APP_URL`
- **Secret**: آدرس نهایی اپلیکیشن
- **مثال**: `https://bot.draton.io`

## تولید کلید SSH (اگر ندارید)

### در سرور:
```bash
# تولید کلید SSH
ssh-keygen -t rsa -b 4096 -C "deployment@tg-app"

# کپی کلید عمومی
cat ~/.ssh/id_rsa.pub
# این کلید را در فایل ~/.ssh/authorized_keys سرور قرار دهید

# کپی کلید خصوصی برای GitHub Secret
cat ~/.ssh/id_rsa
# این کلید را در SERVER_SSH_KEY قرار دهید
```

## تست اتصال SSH

قبل از تنظیم secrets، اتصال SSH را تست کنید:

```bash
ssh -i ~/.ssh/id_rsa username@server-ip
```

## بررسی تنظیمات سرور

### 1. بررسی دایرکتوری اپلیکیشن
```bash
sudo mkdir -p /var/www/tg-app
sudo chown deployment:www-data /var/www/tg-app
sudo chmod 755 /var/www/tg-app
```

### 2. بررسی Nginx
```bash
# بررسی وضعیت
sudo systemctl status nginx

# راه‌اندازی در صورت نیاز
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. تنظیم Virtual Host
فایل `/etc/nginx/sites-available/tg-app`:
```nginx
server {
    listen 80;
    server_name bot.draton.io;  # دامنه شما
    
    root /var/www/tg-app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# فعال‌سازی
sudo ln -s /etc/nginx/sites-available/tg-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## تست نهایی

پس از تنظیم secrets:

1. یک commit جدید به branch `main` push کنید
2. در GitHub Actions نتیجه deployment را بررسی کنید
3. اگر همچنان مشکل دارید، از اسکریپت `verify-deployment.sh` استفاده کنید

## عیب‌یابی رایج

### خطای "Permission denied"
- بررسی کنید کلید SSH صحیح است
- مطمئن شوید کاربر deployment دسترسی sudo دارد

### خطای "Host key verification failed"
- یکبار دستی به سرور SSH کنید تا host key اضافه شود

### خطای "Connection refused"
- بررسی کنید سرور روشن است
- پورت SSH (22) باز است
- فایروال مشکلی ندارد

## کمک بیشتر

برای کمک بیشتر:
- فایل `TROUBLESHOOTING.md` را مطالعه کنید
- اسکریپت‌های `verify-deployment.sh` و `verify-deployment.ps1` را اجرا کنید
- لاگ‌های GitHub Actions را بررسی کنید