# Trang Public & Admin

## Trang Public (Khách Hàng)

> **Lưu ý**: `CategoryNavBar` (nav xanh + dropdown danh mục) được đặt trong `ConditionalLayout` nên hiển thị trên **tất cả trang public** bên dưới Header.
> **Tối ưu hóa Giao diện Dropdown (Premium UI)**: Khi danh sách có từ 10 danh mục trở lên, dropdown sẽ tự động giới hạn chiều cao tối đa ở `400px` và hiển thị thanh cuộn dọc tùy chỉnh mượt mà (`.scrollable-content`) thay vì kéo dài vô tận. Điều này giúp giao diện gọn gàng, tinh tế và không ảnh hưởng đến bố cục của phần nội dung chính bên dưới.
> **Kiến trúc Tối ưu hóa**: Toàn bộ các trang Public chủ chốt (`/`, `/product/[id]`, `/category/[id]`, `/news`, `/news/[id]`, `/search`) đã được nâng cấp thành **Server Components** nhằm truy vấn cơ sở dữ liệu Neon qua Prisma trực tiếp trên máy chủ. Điều này giúp loại bỏ độ trễ Cold Start của API REST, giảm số lượng kết nối rời rạc, hỗ trợ SEO hoàn hảo và đạt tốc độ tải trang tức thì.

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ: HeroSlide, FeatureBadges, Sản Phẩm Nổi Bật, **Tin Tức Mới Nhất (Premium UI)** (slider snap-scroll mượt mà, tự động phân tích nhãn, ước tính thời gian đọc, tích hợp Lucide Icons & hiệu ứng hover động), **Khách Hàng Nói Gì** (carousel nền blue-50), Giới thiệu, Liên hệ. FloatingContactIcons (Zalo + Map + Email) cố định **góc phải** màn hình |
| `/product/[id]` | Chi tiết sản phẩm — **Premium UI**: Gallery ảnh chiếm 7/12 cột (lớn hơn), thông số chiếm 5/12 cột; gallery trượt nhiều ảnh (lightbox zoom thông minh hỗ trợ click ra ngoài/phím Esc để đóng mượt mà, tự động khóa cuộn trang nền), grid thông số nhanh, **Sản phẩm liên quan** hiển thị ngay dưới Trust Badges (2 cột, fold trên), tabs tương tác (Mô tả/Thông số/Chính sách), form báo giá nhanh → Database, floating contact bar mobile |
| `/category/[id]` | Sản phẩm theo danh mục |
| `/news` | Danh sách tin tức — **Premium UI**: Hero banner gradient, **bài nổi bật** (featured article) hiển thị to ở đầu (trang 1), grid 3 cột card có ảnh + meta (ngày + phút đọc) + hover animation, skeleton loading, pagination có scroll-to-top |
| `/news/[id]` | Chi tiết bài tin tức — **Premium UI**: Sticky breadcrumb header, **hero image full-width** có overlay gradient + tiêu đề nổi lên trên ảnh, layout 2 cột (bài viết 8/12 + sidebar 4/12), sidebar có card liên hệ + related news thumbnail; Share buttons (Facebook/Twitter/Copy link); Related news grid dưới bài (mobile) |
| `/search?q=keyword` | Tìm kiếm sản phẩm |
| `/contact` | Form liên hệ |
| `/introduce` | Giới thiệu công ty |

---

## Trang Admin (Quản Trị)

> Đăng nhập tại: `/admin/login`

| Đường dẫn | Mô tả |
|-----------|-------|
| `/admin` | Dashboard tổng quan |
| `/admin/products` | Danh sách sản phẩm — **Premium UI & Phân trang**: Hiển thị **15 sản phẩm trên trang**, hỗ trợ thanh phân trang mượt mà (Pagination), ô tìm kiếm phản hồi nhanh tích hợp cơ chế **reactive debounce (300ms)**. Thẻ thống kê (Stats bar) liên kết trực tiếp với dữ liệu API toàn cục (Tổng sản phẩm, Sản phẩm nổi bật, Sản phẩm nhiều ảnh) thay vì đếm thủ công trên client |
| `/admin/products/new` | Thêm sản phẩm mới — **Tối ưu tốc độ & Lưu nháp**: Áp dụng **Next.js Dynamic Imports (ssr: false)** để lazy-load các thành phần nặng (`TiptapEditor`, `MultiImageUpload`) kèm loading skeleton giúp trang mở ra **ngay lập tức (<100ms)**. Tích hợp cơ chế **tự động lưu nháp (Autosave)** vào `localStorage` mỗi khi có thay đổi, hiển thị banner thông báo khôi phục (Restore Draft) khi phát hiện bản nháp chưa hoàn thành và nút "Lưu nháp" thủ công cực kỳ tiện lợi |
| `/admin/products/edit/[id]` | Sửa sản phẩm — **Tối ưu tốc độ & Lưu nháp**: Tương tự trang new, tự động so khớp khác biệt dữ liệu (Diff comparison) giữa form hiện tại và dữ liệu tải từ DB để kích hoạt tự động lưu nháp riêng biệt cho từng sản phẩm (`product_draft_edit_[id]`), hỗ trợ banner khôi phục khi tải lại trang |
| `/admin/categories` | Quản lý danh mục — CRUD **inline modal** (thêm/sửa/xóa không rời trang, load nhanh) |
| `/admin/news` | Danh sách tin tức — **stats bar** (tổng/xuất bản/nháp), **table/grid view toggle**, search + filter trạng thái, click pill để toggle xuất bản |
| `/admin/news/new` | Thêm tin tức mới — form 3 section card: Nội dung / Hình ảnh bìa / **Xuất bản** (chọn náp/xuất bản bằng card visual); nút “Lưu nháp” + “Đăng tin tức” riêng biệt |
| `/admin/news/edit/[id]` | Sửa tin tức — hiển thị ID + trạng thái hiện tại ở header, layout đồng nhất với trang new |
| `/admin/contacts` | Xem yêu cầu liên hệ |
| `/admin/reviews` | Quản lý đánh giá khách hàng — CRUD **inline modal** (toggle hiển thị) |

---

## Xem Thêm

- [API Endpoints](./api-endpoints.md)
- [Upload & Xác thực](./upload-auth.md)
