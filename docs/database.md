# Cơ Sở Dữ Liệu

Sử dụng **PostgreSQL** qua **Prisma ORM**. Database được host trên **Neon** (serverless PostgreSQL — không reset dữ liệu tự động).

Schema: `prisma/schema.prisma`

---

## Các Model

### Category (Danh mục)

```
id, name, description, icon, image, createdAt, updatedAt
```

### Product (Sản phẩm)

```
id, name, description, categoryId, capacity, accuracy,
price, image, images (String[] — gallery nhiều ảnh),
featured, dialSize, scaleSize,
manufacturer, origin, createdAt, updatedAt
```

> **Lưu ý**: `image` là ảnh chính (thumbnail). `images` là gallery gồm nhiều ảnh (tối đa 10), ảnh đầu tiên trong `images` tự động sync với `image`.

### News (Tin tức)

```
id, title, content, excerpt, image, published, createdAt, updatedAt
```

### ContactRequest (Yêu cầu liên hệ)

```
id, name, phone, email, product, message, status, createdAt
```

### Admin (Tài khoản quản trị)

```
id, email, password, name, createdAt, updatedAt
```

### Review (Đánh giá khách hàng)

```
id, reviewerName, content, rating (1-5), isVisible, createdAt, updatedAt
```

> Chỉ admin mới có thể thêm/sửa/xóa. Hiển thị trên trang chủ qua carousel tự động.

---

## Các Lệnh Prisma

```bash
npm run db:generate     # Generate Prisma client sau khi đổi schema
npm run db:push         # Sync schema lên database (không tạo migration)
npm run db:migrate      # Tạo migration (dùng cho production)
npm run db:seed         # Chạy seed dữ liệu mẫu
npm run db:studio       # Mở Prisma Studio (GUI quản lý DB)
```

---

## Xem Thêm

- [Cài đặt & chạy dự án](./setup.md)
- [Cấu hình môi trường](./environment.md)
- [API Endpoints](./api-endpoints.md)
