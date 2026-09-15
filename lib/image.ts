/**
 * Chuẩn hóa URL ảnh dùng chung cho toàn site.
 *
 * Trước đây nhiều component tự ghép `http://localhost:3000${path}` — đường dẫn
 * này chết hoàn toàn khi deploy production. Ảnh nội bộ bắt đầu bằng "/" vốn đã
 * là đường dẫn tương đối hợp lệ nên trả về nguyên trạng là đủ.
 */
export function resolveImageUrl(image?: string | null): string | null {
  if (!image) return null;
  const trimmed = image.trim();
  if (trimmed === '') return null;
  return trimmed;
}

/**
 * next/image chỉ tối ưu được ảnh từ những host đã khai báo trong next.config.ts;
 * gặp host lạ nó sẽ báo lỗi cấu hình và không render.
 *
 * Dữ liệu cũ trong database còn chứa link ảnh sinh từ dịch vụ ngoài (readdy.ai),
 * nên hàm này nhận diện các URL đó để component truyền `unoptimized` — ảnh vẫn
 * hiển thị bình thường thay vì làm hỏng cả trang. Ảnh nội bộ và ảnh UploadThing
 * vẫn được tối ưu như thường.
 */
const OPTIMIZABLE_HOSTS = ['utfs.io', 'ufs.sh', 'localhost', 'readdy.ai'];

export function isOptimizableImage(url: string | null): boolean {
  if (!url) return false;
  // Ảnh nội bộ (bắt đầu bằng "/") luôn tối ưu được
  if (url.startsWith('/')) return true;
  try {
    const { hostname } = new URL(url);
    return OPTIMIZABLE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    // Không phải URL hợp lệ (ví dụ data: URI) – để trình duyệt tự xử lý
    return false;
  }
}

/** Ảnh thay thế khi sản phẩm/tin tức chưa có hình — SVG inline, không tốn request. */
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#F1F5F9"/>
      <g fill="none" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="140" y="110" width="120" height="90" rx="8"/>
        <path d="M140 175l30-28 24 22 26-30 40 42"/>
        <circle cx="175" cy="136" r="9"/>
      </g>
    </svg>`
  );

/**
 * blurDataURL dùng chung cho next/image — tránh màn trắng khi ảnh đang tải
 * (tiêu chí 7: skeleton thay vì màn trắng).
 */
export const BLUR_DATA_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><rect width="8" height="6" fill="#E2E8F0"/></svg>'
  );
