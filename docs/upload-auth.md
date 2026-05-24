# Upload Hình Ảnh & Xác Thực

## Upload Hình Ảnh

Dự án dùng **UploadThing v7** để lưu ảnh trên cloud. File upload lên UploadThing CDN và xuất hiện trên dashboard uploadthing.com.

| File | Mô tả |
|------|-------|
| `lib/uploadthing.ts` | FileRouter — định nghĩa endpoint `imageUploader` |
| `lib/uploadthing-client.ts` | `generateReactHelpers` → export `useUploadThing` |
| `app/api/uploadthing/route.ts` | Route handler (nodejs runtime, truyền UPLOADTHING_TOKEN) |
| `components/admin/UploadThingUpload.tsx` | Component drag-and-drop, dùng `useUploadThing` hook |
| `components/admin/ImageUpload.tsx` | Re-export alias → dùng trong admin forms |

### Phiên Bản & Giải Pháp Kỹ Thuật

| Package | Phiên bản |
|---------|-----------|
| `uploadthing` | **7.7.4** |
| `@uploadthing/react` | **7.3.3** |

**Vấn đề gốc:** `uploadthing@7.x` và `prisma@6.x` đều phụ thuộc `effect` framework nhưng khác version, gây runtime conflict:
- uploadthing@7 cần `effect@3.17.7`
- prisma@6 kéo theo `effect@3.16.12`

**Giải pháp:** Thêm `"overrides": { "effect": "3.17.7" }` vào `package.json` → npm buộc **toàn bộ** packages dùng `effect@3.17.7` duy nhất.

### Cách Hoạt Động

1. Admin chọn / kéo thả ảnh vào `<ImageUpload>` component
2. `useUploadThing('imageUploader')` hook gửi file trực tiếp lên UploadThing
3. UploadThing xử lý → trả về CDN URL (`ufsUrl`)
4. File xuất hiện trên dashboard [uploadthing.com](https://uploadthing.com)
5. URL (`ufsUrl`) được lưu vào database

### Cấu Hình

```typescript
// app/api/uploadthing/route.ts
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN }, // base64 JWT
});
```

```typescript
// components — v7 dùng res[0].ufsUrl
onClientUploadComplete: (res) => { onChange(res[0].ufsUrl); }
```

### Giới Hạn

- Kích thước tối đa: **4MB** per file
- Định dạng hỗ trợ: JPG, PNG, WebP, GIF

### Lưu Ý Môi Trường

> **v7 dùng `UPLOADTHING_TOKEN`** (dạng base64 `eyJ...` chứa apiKey + appId + region).
> Xem [environment.md](./environment.md) để cấu hình đúng.

---

## Xác Thực (Authentication)

Sử dụng **NextAuth.js** với `CredentialsProvider`.

Cấu hình: `lib/auth.ts`

| Thông số | Giá trị |
|----------|---------| 
| Provider | CredentialsProvider |
| Đăng nhập | Email + Password |
| Session | JWT-based |
| Bảo vệ route | Middleware check trong `AdminLayout` |

### Tạo Admin Lần Đầu

```bash
curl -X POST http://localhost:3000/api/create-admin
```

Hoặc thêm thủ công qua Prisma Studio:

```bash
npm run db:studio
```

### Lưu Ý Bảo Mật

> Password hiện đang so sánh dạng **plain text** trong `lib/auth.ts`. Trước khi đưa lên production, hãy dùng **bcrypt**:

```bash
npm install bcryptjs @types/bcryptjs
```

---

## Xem Thêm

- [Cấu hình môi trường](./environment.md)
- [API Endpoints](./api-endpoints.md)
- [Deploy lên Vercel](./deploy.md)
