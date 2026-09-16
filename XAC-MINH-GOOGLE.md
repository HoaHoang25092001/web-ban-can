# Cách xác minh cangiare.com với Google Search Console

## Vì sao báo lỗi "Không xác minh được quyền sở hữu"

Bạn chọn cách xác minh **"Nhà cung cấp tên miền"**. Cách này yêu cầu thêm một
bản ghi TXT vào DNS. Tôi đã kiểm tra thực tế:

| Kiểm tra | Kết quả |
|---|---|
| Bản ghi TXT của cangiare.com | **không có bản ghi nào** |
| DNS đang do ai quản lý | **Cloudflare** (darwin.ns.cloudflare.com) |
| Domain trỏ về | Vercel (64.29.17.65) |
| https://cangiare.com | **chạy tốt** (HTTP 200) |
| https://www.cangiare.com | **không truy cập được** |

Google không tìm thấy mã xác minh vì bản ghi TXT **chưa được thêm vào
Cloudflare**, hoặc đã thêm nhưng sai chỗ.

---

## Cách 1 — Dùng thẻ HTML (DỄ NHẤT, khuyến nghị)

Website đã được chuẩn bị sẵn cho cách này. Không cần đụng tới DNS.

### Bước 1: Lấy mã từ Google

1. Vào https://search.google.com/search-console
2. Bấm **Thêm tài sản**
3. Chọn ô **bên phải** — **Tiền tố URL** (KHÔNG chọn ô bên trái "Miền")
4. Nhập chính xác: `https://cangiare.com`
5. Bấm **Tiếp tục**
6. Trong danh sách phương thức, mở mục **Thẻ HTML**
7. Google hiện một dòng như:

   ```html
   <meta name="google-site-verification" content="AbC123xYz..." />
   ```

8. **Chỉ copy phần trong `content="..."`** — tức đoạn `AbC123xYz...`,
   không lấy cả thẻ

### Bước 2: Đưa mã vào website

Website đang chạy trên Vercel, nên phải đặt trên Vercel (sửa file `.env` ở máy
không có tác dụng với bản đang online):

1. Vào https://vercel.com → chọn dự án của bạn
2. **Settings** → **Environment Variables**
3. Bấm **Add New**:
   - **Key**: `GOOGLE_SITE_VERIFICATION`
   - **Value**: đoạn mã vừa copy
   - **Environments**: tích cả ba (Production, Preview, Development)
4. Bấm **Save**
5. Sang tab **Deployments** → deployment mới nhất → dấu **⋯** → **Redeploy**

> Phải Redeploy thì biến môi trường mới có hiệu lực. Chỉ lưu biến thôi chưa đủ.

### Bước 3: Xác minh

Đợi khoảng 2 phút cho deploy xong, kiểm tra bằng cách mở
https://cangiare.com → chuột phải → **Xem nguồn trang** → tìm
`google-site-verification`. Nếu thấy dòng đó là được.

Quay lại Search Console bấm **Xác minh**.

---

## Cách 2 — Thêm bản ghi TXT trên Cloudflare

Dùng khi muốn xác minh cả domain (gồm mọi tên miền phụ).

1. Vào https://dash.cloudflare.com → chọn **cangiare.com**
2. Menu trái → **DNS** → **Records** → **Add record**
3. Điền:
   - **Type**: `TXT`
   - **Name**: `@` (ký tự @, nghĩa là chính domain gốc)
   - **Content**: đoạn mã Google cho, dạng `google-site-verification=abc123...`
   - **TTL**: Auto
4. **Save**
5. Đợi 5–30 phút rồi bấm Xác minh trong Search Console

### Lỗi hay gặp ở cách này

| Lỗi | Cách sửa |
|---|---|
| Điền Name là `cangiare.com` | Phải là `@` |
| Chỉ dán phần mã, thiếu tiền tố | Content phải có đủ `google-site-verification=...` |
| Thêm nhầm vào nhà cung cấp cũ | DNS đang ở **Cloudflare**, phải thêm tại đó |
| Bấm xác minh ngay | DNS cần 5–30 phút mới lan truyền |

---

## Việc nên làm thêm: sửa www.cangiare.com

Hiện `www.cangiare.com` **không truy cập được**. Khách quen gõ `www.` sẽ gặp
trang lỗi và bỏ đi.

Sửa trên Cloudflare:

1. **DNS** → **Add record**
2. **Type**: `CNAME` · **Name**: `www` · **Target**: `cname.vercel-dns.com`
   · **Proxy status**: bật (đám mây màu cam)
3. Save

Sau đó vào Vercel → **Settings** → **Domains** → thêm `www.cangiare.com` và
đặt chuyển hướng về `cangiare.com`.

> Website đã có sẵn thẻ canonical trỏ về `https://cangiare.com`, nên Google
> hiểu đâu là địa chỉ chuẩn. Nhưng để `www` lỗi vẫn mất khách thật.

---

## Sau khi xác minh thành công

1. Menu trái → **Sơ đồ trang web** → nhập `sitemap.xml` → **Gửi**
2. Menu trái → **Kiểm tra URL** → dán `https://cangiare.com` →
   **Yêu cầu lập chỉ mục**

Sau đó xem tiếp [HUONG-DAN-SEO.md](HUONG-DAN-SEO.md) — đặc biệt là phần
**Google Doanh nghiệp**, kênh mang khách nhanh hơn SEO nhiều lần với cửa hàng
có địa chỉ thật.
