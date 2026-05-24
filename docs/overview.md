# Tổng Quan Dự Án

## Mô Tả

Website bán cân (thiết bị đo lường) xây dựng bằng **Next.js 15** với App Router. Hệ thống gồm:

- **Trang khách hàng**: Xem sản phẩm, danh mục, tin tức, liên hệ
- **Trang quản trị (Admin)**: Quản lý sản phẩm, danh mục, tin tức, yêu cầu liên hệ

---

## Công Nghệ Sử Dụng

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| [Next.js](https://nextjs.org) | 15.x | React framework với App Router |
| [React](https://react.dev) | 19.x | UI library |
| [Prisma](https://prisma.io) | 6.x | ORM - kết nối PostgreSQL |
| [Neon](https://neon.tech) | - | Serverless PostgreSQL (không reset tự động) |
| [NextAuth.js](https://next-auth.js.org) | 4.x | Xác thực người dùng |
| [UploadThing](https://uploadthing.com) | 7.x | Lưu trữ & upload hình ảnh trên cloud |
| [Tiptap](https://tiptap.dev) | 3.x | Rich text editor |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | CSS framework |
| [React Hook Form](https://react-hook-form.com) | 7.x | Quản lý form |
| [Zod](https://zod.dev) | 4.x | Validation schema |
| [Recharts](https://recharts.org) | 3.x | Biểu đồ thống kê |

---

## Xem Thêm

- [Cấu trúc dự án](./project-structure.md)
- [Cài đặt & chạy dự án](./setup.md)
- [Cấu hình môi trường](./environment.md)
- [Cơ sở dữ liệu](./database.md)
- [API Endpoints](./api-endpoints.md)
- [Trang Public & Admin](./pages.md)
- [Upload & Xác thực](./upload-auth.md)
- [Deploy lên Vercel](./deploy.md)
