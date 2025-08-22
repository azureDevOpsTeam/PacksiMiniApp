# راهنمای CI/CD برای پروژه Packsi Mini App

## خلاصه
یک GitHub Actions workflow برای deployment خودکار پروژه تنظیم شده است که:

✅ هنگام push به branch اصلی (main/master) فعال می‌شود  
✅ پروژه را با `npm install` و `npm run build` build می‌کند  
✅ فایل‌های build شده را در مسیر `/var/www/tg-app/build` در سرور قرار می‌دهد  
✅ مجوزهای مناسب را تنظیم می‌کند  

## فایل‌های ایجاد شده

### `.github/workflows/deploy.yml`
Workflow اصلی که شامل مراحل زیر است:
1. **Checkout**: دریافت کد از repository
2. **Setup Node.js**: نصب Node.js نسخه 18
3. **Install dependencies**: اجرای `npm install`
4. **Build project**: اجرای `npm run build`
5. **Deploy to server**: آماده‌سازی مسیر در سرور
6. **Copy files**: کپی فایل‌های build شده
7. **Set permissions**: تنظیم مجوزهای مناسب

## تنظیمات مورد نیاز

### GitHub Secrets
برای عملکرد صحیح، باید secrets زیر را در GitHub تنظیم کنید:

| Secret Name | توضیحات | مثال |
|-------------|---------|-------|
| `SERVER_HOST` | آدرس IP یا دامنه سرور | `192.168.1.100` |
| `SERVER_USER` | نام کاربری SSH | `ubuntu` |
| `SERVER_SSH_KEY` | کلید خصوصی SSH | محتوای فایل `~/.ssh/id_rsa` |
| `SERVER_PORT` | پورت SSH (اختیاری) | `22` |
| `APP_URL` | آدرس نهایی اپ (اختیاری) | `https://tg.packsi.net` |

### مسیر در سرور
- **مسیر build**: `/var/www/tg-app/build`
- **مالکیت فایل‌ها**: `www-data:www-data`
- **مجوزها**: `755`

## نحوه استفاده

1. **تنظیم Secrets**: طبق راهنمای `GITHUB_SECRETS_SETUP.md`
2. **Push کردن**: هر push به branch اصلی، deployment را شروع می‌کند
3. **مشاهده پیشرفت**: در بخش Actions repository

## ساختار فایل‌های Build

پس از build موفق، ساختار فایل‌ها در سرور:
```
/var/www/tg-app/build/
├── index.html
├── assets/
│   ├── [name].[hash].js
│   ├── [name].[hash].css
│   └── ...
└── ...
```

## عیب‌یابی

### خطاهای رایج

1. **SSH Connection Failed**
   - بررسی صحت `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`
   - اطمینان از صحت `SERVER_SSH_KEY`

2. **Permission Denied**
   - کاربر SSH باید دسترسی sudo داشته باشد
   - بررسی مجوزهای مسیر `/var/www/`

3. **Build Failed**
   - بررسی dependencies در `package.json`
   - اطمینان از صحت script های build

### لاگ‌ها
برای مشاهده جزئیات خطا:
1. به repository در GitHub بروید
2. بخش **Actions** را انتخاب کنید
3. روی آخرین workflow run کلیک کنید
4. جزئیات هر step را بررسی کنید

## نکات امنیتی

⚠️ **هشدار**: کلید SSH را هرگز در کد commit نکنید  
✅ فقط از GitHub Secrets استفاده کنید  
✅ کلید SSH باید بدون passphrase باشد  
✅ دسترسی کاربر SSH را محدود کنید  

## پشتیبانی

در صورت بروز مشکل:
1. ابتدا فایل `TROUBLESHOOTING.md` را مطالعه کنید
2. لاگ‌های GitHub Actions را بررسی کنید
3. تنظیمات SSH و مجوزهای سرور را چک کنید