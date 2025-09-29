# 🚀 HƯỚNG DẪN DEPLOY WEBSITE LÊN VERCEL
# =======================================

## BƯỚC 1: SETUP DATABASE NEON (MIỄN PHÍ)
1. Truy cập: https://neon.tech
2. Đăng ký/đăng nhập
3. Tạo project mới: "web-ban-can"
4. Copy connection string có dạng:
   `postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require`

## BƯỚC 2: CHUẨN BỊ ENVIRONMENT VARIABLES
Tạo các giá trị sau (sẽ nhập vào Vercel):

### Database
- `DATABASE_URL`: Connection string từ Neon

### NextAuth  
- `NEXTAUTH_SECRET`: Chạy lệnh `openssl rand -base64 32` để tạo
- `NEXTAUTH_URL`: Sẽ là URL Vercel (vd: https://your-app.vercel.app)

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`: Tên cloud từ dashboard
- `CLOUDINARY_API_KEY`: API key
- `CLOUDINARY_API_SECRET`: API secret

## BƯỚC 3: PUSH CODE LÊN GITHUB
```bash
git init
git add .
git commit -m "Initial deployment setup"
git branch -M main
git remote add origin https://github.com/your-username/web-ban-can.git
git push -u origin main
```

## BƯỚC 4: DEPLOY TRÊN VERCEL
1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click "Add New..." -> "Project"
4. Import repository "web-ban-can"
5. Framework preset: Next.js (tự động detect)
6. Click "Deploy"

## BƯỚC 5: CẤU HÌNH ENVIRONMENT VARIABLES
Trong Vercel dashboard:
1. Vào project settings
2. Tab "Environment Variables"  
3. Thêm các biến:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (https://your-app.vercel.app)
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

## BƯỚC 6: SETUP DATABASE PRODUCTION
Sau khi deploy thành công:
1. Vào Vercel dashboard
2. Tab "Functions" -> chọn 1 function
3. Mở terminal hoặc dùng Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Liên kết project
vercel link

# Chạy Prisma commands
vercel env pull .env.production
npx prisma db push
npx prisma db seed (nếu có)
```

## BƯỚC 7: KIỂM TRA & TEST
1. Truy cập URL Vercel của bạn
2. Test các chức năng:
   - Trang chủ
   - Admin login
   - CRUD operations
   - Upload ảnh

## LƯU Ý QUAN TRỌNG:
- ✅ Free tier Vercel: 100GB bandwidth/tháng
- ✅ Neon free: 3GB database
- ✅ Cloudinary free: 25GB storage
- 🔄 Mỗi lần push code mới = auto deploy
- 📱 Tự động có SSL certificate
- 🌍 Global CDN

## TROUBLESHOOTING:
- Nếu build lỗi: Check logs trong Vercel dashboard
- Database lỗi: Verify connection string
- NextAuth lỗi: Check NEXTAUTH_URL và NEXTAUTH_SECRET
- Image upload lỗi: Check Cloudinary credentials