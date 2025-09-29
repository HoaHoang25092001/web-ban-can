# Hướng dẫn Setup Database với Supabase

## Bước 1: Tạo tài khoản Supabase

1. Truy cập https://supabase.com
2. Đăng ký tài khoản miễn phí
3. Tạo một project mới

## Bước 2: Lấy thông tin kết nối

1. Trong dashboard Supabase, vào Settings > Database
2. Copy Database URL (dạng: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres)
3. Vào Settings > API để lấy:
   - Project URL
   - anon public key

## Bước 3: Cập nhật file .env

Thay thế các thông tin trong file `.env`:

```env
# Database URL từ Supabase
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_REF].supabase.co:5432/postgres"

# NextAuth Secret - Tạo một secret key random
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase credentials (optional)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## Bước 4: Chạy migration và seed data

Sau khi cập nhật `.env`, chạy các lệnh:

```bash
# Generate Prisma client
npm run db:generate

# Tạo tables trong database
npm run db:migrate

# Import dữ liệu mẫu
npm run db:seed
```

## Bước 5: Kiểm tra kết nối

Chạy lệnh để mở Prisma Studio:

```bash
npm run db:studio
```

Prisma Studio sẽ mở tại http://localhost:5555 để bạn xem và quản lý dữ liệu.

## Bước 6: Chạy ứng dụng

```bash
npm run dev
```

Website sẽ chạy tại http://localhost:3000

## Tính năng đã triển khai:

1. **API Routes**: `/api/products`, `/api/categories`, `/api/contacts`
2. **Components mới**: `FeaturedProductsDB.tsx`, `ProductCategoriesDB.tsx`
3. **Admin login**: `/admin/login` (tài khoản: admin@webcancban.com / admin123)
4. **Database schema**: Products, Categories, News, ContactRequests, Admins

## Các bước tiếp theo:

1. Tạo giao diện admin để quản lý sản phẩm
2. Thêm upload hình ảnh với Supabase Storage
3. Tạo API cho News/Tin tức
4. Thêm tính năng search và filter
5. Tối ưu hóa cho SEO

## Lưu ý quan trọng:

- File `.env` chứa thông tin nhạy cảm, không commit lên git
- Password admin hiện tại chưa được hash, cần cải thiện bảo mật
- Cần setup storage cho upload hình ảnh sản phẩm
- Cần thêm validation cho API endpoints
