# Deploy Lên Vercel

## Yêu Cầu Trước Khi Deploy

- Code đã được đẩy lên GitHub
- Tài khoản [Vercel](https://vercel.com)
- Database PostgreSQL trên [Neon](https://neon.tech) hoặc [Supabase](https://supabase.com)
- Tài khoản [Cloudinary](https://cloudinary.com)

---

## Các Bước Deploy

### Bước 1: Import project lên Vercel

1. Vào [vercel.com/new](https://vercel.com/new)
2. Import repository từ GitHub
3. Cấu hình **Environment Variables** (xem bảng bên dưới)

### Bước 2: Build command

Vercel tự đọc từ `package.json`:

```json
"vercel-build": "npm install --legacy-peer-deps && next build"
```

### Bước 3: Biến môi trường trên Vercel

| Biến | Ghi chú |
|------|---------|
| `DATABASE_URL` | Connection string từ Neon/Supabase |
| `DIRECT_DATABASE_URL` | Direct connection (Supabase cần) |
| `NEXTAUTH_URL` | URL Vercel của bạn (vd: `https://myapp.vercel.app`) |
| `NEXTAUTH_SECRET` | Secret ngẫu nhiên |
| `CLOUDINARY_CLOUD_NAME` | Cloud name |
| `CLOUDINARY_API_KEY` | API key |
| `CLOUDINARY_API_SECRET` | API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name (public) |

### Bước 4: Migrate database sau deploy

```bash
# Chạy local với DATABASE_URL trỏ đến Neon/Supabase
npm run db:push
```

---

## Lưu Ý Quan Trọng

- `NEXTAUTH_URL` phải đổi thành URL Vercel thật, không dùng `localhost`
- File `.env.local` không được commit — xem [environment.md](./environment.md)
- Dùng `--legacy-peer-deps` vì React 19 chưa được một số packages hỗ trợ chính thức
- Password đang plain text — hash bằng bcrypt trước production — xem [upload-auth.md](./upload-auth.md)

---

## Xem Thêm

- [Cấu hình môi trường](./environment.md)
- [Cài đặt & chạy dự án](./setup.md)
