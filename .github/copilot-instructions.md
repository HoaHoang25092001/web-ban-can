# Web Bán Cân — Copilot Instructions

Website bán cân (thiết bị đo lường) dùng **Next.js 15 App Router**.  
File này được tự động cập nhật bởi `npm run docs:sync`.

---

## Tech Stack

| | |
|-|-|
| Framework | Next.js 15, React 19, TypeScript |
| Database | PostgreSQL via Prisma 6 (Supabase / Neon) |
| Auth | NextAuth.js 4 — CredentialsProvider, JWT session |
| Images | Cloudinary (upload qua `/api/upload`) |
| Editor | Tiptap 3 (rich text) |
| Styles | Tailwind CSS 4 |
| Forms | React Hook Form 7 + Zod 4 |
| Charts | Recharts 3 |

---

## Cấu Trúc Quan Trọng

```
app/           → Next.js App Router (pages + API routes)
app/api/       → REST API handlers (route.ts)
app/admin/     → Protected admin area (check session in AdminLayout)
components/    → Reusable UI; components/admin/ cho admin riêng
lib/           → prisma.ts | auth.ts | cloudinary.ts
prisma/        → schema.prisma (nguồn sự thật của DB)
```

---

## DB Models

<!-- AUTO:models -->
**Category**: id, name, description, icon, image, createdAt, updatedAt, products
**Product**: id, name, description, categoryId, capacity, accuracy, price, image, featured, dialSize, scaleSize, manufacturer, origin, createdAt, updatedAt, category
**News**: id, title, content, excerpt, image, published, createdAt, updatedAt
**ContactRequest**: id, name, phone, email, product, message, status, createdAt
**Admin**: id, email, password, name, createdAt, updatedAt
<!-- /AUTO:models -->

---

## App Routes (Pages)

<!-- AUTO:routes -->
| Route | File |
|-------|------|
| `/` | `app/page.tsx` |
| `/category/[id]` | `app/category/[id]/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/introduce` | `app/introduce/page.tsx` |
| `/news` | `app/news/page.tsx` |
| `/news/[id]` | `app/news/[id]/page.tsx` |
| `/product/[id]` | `app/product/[id]/page.tsx` |
| `/search` | `app/search/page.tsx` |
| `/admin` | `app/admin/page.tsx` |
| `/admin/categories` | `app/admin/categories/page.tsx` |
| `/admin/categories/edit/[id]` | `app/admin/categories/edit/[id]/page.tsx` |
| `/admin/categories/new` | `app/admin/categories/new/page.tsx` |
| `/admin/contacts` | `app/admin/contacts/page.tsx` |
| `/admin/login` | `app/admin/login/page.tsx` |
| `/admin/news` | `app/admin/news/page.tsx` |
| `/admin/news/edit/[id]` | `app/admin/news/edit/[id]/page.tsx` |
| `/admin/news/new` | `app/admin/news/new/page.tsx` |
| `/admin/products` | `app/admin/products/page.tsx` |
| `/admin/products/edit/[id]` | `app/admin/products/edit/[id]/page.tsx` |
| `/admin/products/new` | `app/admin/products/new/page.tsx` |
<!-- /AUTO:routes -->

---

## API Endpoints

<!-- AUTO:api -->
| Endpoint | File |
|----------|------|
| `/api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` |
| `/api/categories` | `app/api/categories/route.ts` |
| `/api/categories/[id]` | `app/api/categories/[id]/route.ts` |
| `/api/contacts` | `app/api/contacts/route.ts` |
| `/api/contacts/[id]` | `app/api/contacts/[id]/route.ts` |
| `/api/create-admin` | `app/api/create-admin/route.ts` |
| `/api/news` | `app/api/news/route.ts` |
| `/api/news/[id]` | `app/api/news/[id]/route.ts` |
| `/api/products` | `app/api/products/route.ts` |
| `/api/products/[id]` | `app/api/products/[id]/route.ts` |
| `/api/upload` | `app/api/upload/route.ts` |
<!-- /AUTO:api -->

---

## Components

<!-- AUTO:components -->
- `components/AboutSection.tsx`
- `components/AllProductsByCategory.tsx`
- `components/ConditionalLayout.tsx`
- `components/ConfirmDialog.tsx`
- `components/ContactSection.tsx`
- `components/FeaturedProducts.tsx`
- `components/FeaturedProductsDB.tsx`
- `components/Footer.tsx`
- `components/Header.tsx`
- `components/HeroSection.tsx`
- `components/NewsSlider.tsx`
- `components/ProductCard.tsx`
- `components/ProductCategories.tsx`
- `components/ProductCategoriesDB.tsx`
- `components/ProductCategorySidebar.tsx`
- `components/ProductDetail.tsx`
- `components/RichContentDisplay.tsx`
- `components/SearchProduct.tsx`
- `components/SessionProvider.tsx`
- `components/TestRichContent.tsx`
- `components/Toast.tsx`
- `components/admin/AdminLayout.tsx`
- `components/admin/CloudinaryUpload.tsx`
- `components/admin/FormComponents.tsx`
- `components/admin/ImageUpload.tsx`
- `components/admin/ProductFilter.tsx`
- `components/admin/RichTextEditorStable.tsx`
- `components/admin/SimpleRichTextEditor.tsx`
- `components/admin/Table.tsx`
- `components/admin/TiptapEditor.tsx`
<!-- /AUTO:components -->

---

## Key Conventions

- Dùng `--legacy-peer-deps` khi cài package (React 19 chưa được hỗ trợ đầy đủ)
- Prisma client singleton: `lib/prisma.ts`
- Admin route bảo vệ bằng session check trong `components/admin/AdminLayout.tsx`
- Password hiện **plain text** trong `lib/auth.ts` — cần bcrypt trước production
- Upload ảnh: components `ImageUpload` hoặc `CloudinaryUpload`, lưu folder `web-ban-can/` trên Cloudinary
- `.env.local` không commit; xem `docs/environment.md` để biết các biến cần thiết
- Build cho Vercel: `npm install --legacy-peer-deps && next build`

---

## Useful Commands

```bash
npm run dev           # Start dev server :3000
npm run db:push       # Sync schema to DB
npm run db:studio     # Prisma Studio GUI
npm run db:seed       # Seed sample data
npm run docs:sync     # Cập nhật lại file này từ code
curl -X POST http://localhost:3000/api/create-admin  # Tạo admin lần đầu
```
