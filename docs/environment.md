# Cấu Hình Môi Trường

Tạo file `.env.local` tại thư mục gốc với nội dung sau:

```env
# =====================
# DATABASE (Neon PostgreSQL)
# =====================
# Pooled connection — dùng cho runtime queries
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
# Direct connection — dùng cho Prisma migrations
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/neondb?sslmode=require"

# =====================
# NEXTAUTH
# =====================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# =====================
# UPLOADTHING (Upload ảnh) — hiện dùng v6.13.3
# =====================
# SECRET (dạng sk_live_...) — BẮT BUỘC cho v6
UPLOADTHING_SECRET="sk_live_your_secret_key_here"
# TOKEN (dạng base64 eyJ...) — chỉ cần cho v7+, giữ lại để tham khảo
# UPLOADTHING_TOKEN="eyJhcGlLZXkiOiJza19saXZlX..."
```

---

## Cách Lấy Các Giá Trị

### DATABASE_URL — Neon

1. Vào [neon.tech](https://neon.tech) → Đăng ký / Đăng nhập
2. Tạo project mới → Chọn region **Singapore** (gần VN nhất)
3. Trong dashboard → **Connect** → lấy **2 loại connection string**:
   - **Pooled connection** → dùng cho `DATABASE_URL`
   - **Direct connection** → dùng cho `DIRECT_DATABASE_URL` (bỏ `-pooler` khỏi hostname)

> **Lưu ý:** Neon free tier **không tự xóa dữ liệu**. Branch auto-suspend sau 14 ngày không query nhưng wake up ngay khi có request.

### NEXTAUTH_SECRET

```bash
# Tạo secret ngẫu nhiên
openssl rand -base64 32
```

### UPLOADTHING_SECRET (v6)

1. Vào [uploadthing.com](https://uploadthing.com) → Đăng ký
2. Tạo App mới → Vào **API Keys**
3. Copy **Secret Key** (dạng `sk_live_...`)

> **Lưu ý:** v6 dùng `UPLOADTHING_SECRET` (dạng `sk_live_...`).
> Nếu bạn thấy **Token** (dạng base64 `eyJ...`), decode nó để lấy `apiKey` field.

---

## Lưu Ý Bảo Mật

- File `.env.local` **không được commit** lên Git
- Đảm bảo `.gitignore` có dòng `.env*`

---

## Xem Thêm

- [Cài đặt & chạy dự án](./setup.md)
- [Deploy lên Vercel](./deploy.md) — biến môi trường cho production
