# Cấu Trúc Dự Án

```
web-ban-can/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Trang chủ
│   ├── globals.css             # Global styles
│   │
│   ├── api/                    # API Routes (REST)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── categories/         # CRUD danh mục
│   │   ├── products/           # CRUD sản phẩm
│   │   ├── news/               # CRUD tin tức
│   │   ├── contacts/           # CRUD liên hệ
│   │   ├── upload/             # Upload ảnh lên Cloudinary
│   │   └── create-admin/       # Tạo tài khoản admin
│   │
│   ├── admin/                  # Khu vực quản trị (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── login/              # Đăng nhập admin
│   │   ├── products/           # Quản lý sản phẩm
│   │   ├── categories/         # Quản lý danh mục
│   │   ├── news/               # Quản lý tin tức
│   │   └── contacts/           # Xem yêu cầu liên hệ
│   │
│   ├── product/[id]/           # Chi tiết sản phẩm (Server Component & ProductDetailClient.tsx)
│   ├── category/[id]/          # Sản phẩm theo danh mục (Server Component)
│   ├── news/                   # Danh sách & chi tiết tin tức (Server Component & NewsDetailClient.tsx)
│   ├── search/                 # Tìm kiếm sản phẩm (Server Component)
│   ├── contact/                # Form liên hệ
│   └── introduce/              # Giới thiệu công ty
│
├── components/                 # Reusable UI components
│   ├── Header.tsx               # Logo giữa, search trái, SĐT pill-border phải, không có nav menu
│   ├── Footer.tsx
│   ├── CategoryNavBar.tsx       # Nav bar xanh + danh mục: hỗ trợ nạp dữ liệu tĩnh & cache, tự động cuộn (scroll) khi có >= 10 danh mục với scrollbar tùy chỉnh mượt mà
│   ├── NavWithHeroSection.tsx   # Slide hero trang chủ, width đồng bộ CATEGORY_WIDTH=240px
│   ├── FeatureBadges.tsx        # 4 thẻ dịch vụ bên dưới hero (vận chuyển, chất lượng, đổi trả, hỗ trợ)
│   ├── ProductCard.tsx          # Card sản phẩm: chỉ hiển thị ảnh, tên, giá. object-cover, aspect-[4/3]
│   ├── FeaturedProductsDB.tsx   # Sản phẩm nổi bật: layout full-width, nạp dữ liệu từ máy chủ
│   ├── NewsSlider.tsx           # Slider tin tức tự động chạy
│   ├── SearchProduct.tsx        # Hỗ trợ prop compact=true dùng trong Header
│   ├── ContactSection.tsx
│   ├── Loading.tsx              # Component Loading hệ thống dùng chung (Spinner & Skeletons)
│   ├── RichContentDisplay.tsx
│   └── admin/                  # Admin-specific components
│       ├── AdminLayout.tsx
│       ├── TiptapEditor.tsx    # Rich text editor
│       ├── ImageUpload.tsx     # Upload ảnh
│       ├── Table.tsx
│       ├── FormComponents.tsx
│       └── ProductFilter.tsx
│
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   └── cloudinary.ts           # Cloudinary config
│
├── prisma/
│   ├── schema.prisma           # DB schema (PostgreSQL)
│   ├── schema-postgres.prisma  # PostgreSQL schema
│   ├── schema-sqlite.prisma    # SQLite schema (dev)
│   └── seed.ts                 # Seed dữ liệu mẫu
│
├── types/
│   └── next-auth.d.ts          # Type extensions
│
├── public/
│   ├── uploads/                # Static uploads (nếu dùng local)
│   ├── slide1.png              # Ảnh slide hero 1 (Cân Bàn Điện Tử)
│   ├── slide2.png              # Ảnh slide hero 2 (Cân Sàn Công Nghiệp)
│   └── slide3.png              # Ảnh slide hero 3 (Cân Phân Tích & Kỹ Thuật)
│
├── .env.local                  # Biến môi trường (KHÔNG commit)
├── next.config.ts
├── tailwind.config.js
└── package.json
```

---

## Xem Thêm

- [Tổng quan](./overview.md)
- [Cài đặt & chạy dự án](./setup.md)
