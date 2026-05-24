# Cài Đặt & Chạy Dự Án

## Yêu Cầu Hệ Thống

- **Node.js** >= 18.x
- **npm** >= 9.x (hoặc yarn/pnpm)
- **PostgreSQL** (hoặc tài khoản Supabase / Neon)
- **Tài khoản Cloudinary** (để upload ảnh)

---

## Các Bước Cài Đặt

### Bước 1: Clone & cài dependencies

```bash
git clone <repository-url>
cd web-ban-can
npm install --legacy-peer-deps
```

> **Lưu ý**: Dùng `--legacy-peer-deps` vì một số package chưa hỗ trợ React 19 chính thức.

### Bước 2: Cấu hình biến môi trường

Tạo file `.env.local` — xem chi tiết tại [environment.md](./environment.md).

### Bước 3: Thiết lập database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema lên database
npm run db:seed       # (Tuỳ chọn) Seed dữ liệu mẫu
```

### Bước 4: Chạy môi trường development

```bash
npm run dev
```

- Trang chủ: [http://localhost:3000](http://localhost:3000)
- Trang Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### Bước 5: Tạo tài khoản Admin (lần đầu)

```bash
curl -X POST http://localhost:3000/api/create-admin
```

---

## Scripts

```bash
npm run dev             # Chạy development server (port 3000)
npm run build           # Build production
npm run start           # Chạy production server
npm run lint            # Kiểm tra lỗi ESLint

npm run db:generate     # Generate Prisma client
npm run db:push         # Sync schema lên DB
npm run db:migrate      # Tạo migration
npm run db:seed         # Seed dữ liệu mẫu
npm run db:studio       # Mở Prisma Studio GUI
```

---

## Xem Thêm

- [Cấu hình môi trường](./environment.md)
- [Cơ sở dữ liệu](./database.md)
- [Deploy lên Vercel](./deploy.md)
