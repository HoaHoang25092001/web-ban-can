# Deployment Setup Guide
# ======================

## 1. Tạo Neon Database (FREE)
1. Truy cập: https://neon.tech
2. Đăng ký tài khoản
3. Tạo project mới
4. Copy connection string và paste vào DATABASE_URL

## 2. Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 3. Cloudinary Setup (nếu chưa có)
1. Truy cập: https://cloudinary.com
2. Đăng ký free account
3. Copy: Cloud Name, API Key, API Secret

## 4. Cập nhật .env.production
- Thay thế tất cả placeholder values
- NEXTAUTH_URL sẽ là URL Vercel sau khi deploy

## 5. Commands để deploy
```bash
# Migrate database to PostgreSQL
npm run db:generate
npx prisma db push

# Seed data (if needed)
npm run db:seed

# Build for production
npm run build
```