# API Endpoints

Tất cả API nằm tại `app/api/`. Chuẩn REST, trả về JSON.

---

## Categories

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| POST | `/api/categories` | Tạo danh mục mới |
| GET | `/api/categories/[id]` | Lấy danh mục theo ID |
| PUT | `/api/categories/[id]` | Cập nhật danh mục |
| DELETE | `/api/categories/[id]` | Xoá danh mục |

---

## Products

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| GET | `/api/products/[id]` | Lấy sản phẩm theo ID |
| PUT | `/api/products/[id]` | Cập nhật sản phẩm |
| DELETE | `/api/products/[id]` | Xoá sản phẩm |

**Query params cho `GET /api/products`:**

| Param | Mô tả |
|-------|-------|
| `?categoryId=1` | Lọc theo danh mục |
| `?featured=true` | Lọc sản phẩm nổi bật |
| `?search=keyword` | Tìm kiếm theo tên |

---

## News

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/news` | Lấy danh sách tin tức |
| POST | `/api/news` | Tạo tin tức mới |
| GET | `/api/news/[id]` | Lấy tin tức theo ID |
| PUT | `/api/news/[id]` | Cập nhật tin tức |
| DELETE | `/api/news/[id]` | Xoá tin tức |

---

## Reviews (Đánh giá khách hàng)

| Method | Endpoint | Mô tả |
|--------|------------|-------|
| GET | `/api/reviews` | Lấy đánh giá hiển thị (public) |
| GET | `/api/reviews?all=true` | Lấy tất cả (admin) |
| POST | `/api/reviews` | Tạo đánh giá mới (admin) |
| GET | `/api/reviews/[id]` | Lấy đánh giá theo ID |
| PUT | `/api/reviews/[id]` | Cập nhật đánh giá (admin) |
| DELETE | `/api/reviews/[id]` | Xóa đánh giá (admin) |

---

## Contacts

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/contacts` | Lấy danh sách yêu cầu liên hệ |
| POST | `/api/contacts` | Tạo yêu cầu liên hệ mới |
| GET | `/api/contacts/[id]` | Lấy yêu cầu theo ID |
| PUT | `/api/contacts/[id]` | Cập nhật trạng thái |
| DELETE | `/api/contacts/[id]` | Xoá yêu cầu |

---

## Upload & Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/upload` | Upload ảnh lên Cloudinary |
| POST | `/api/create-admin` | Tạo tài khoản admin mặc định |

---

## Xem Thêm

- [Cơ sở dữ liệu](./database.md) — cấu trúc các model
- [Upload & Xác thực](./upload-auth.md)
