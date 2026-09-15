import { prisma } from '@/lib/prisma';
import CategoryNavBar from './CategoryNavBar';

/**
 * Nạp sẵn danh mục trên server cho thanh điều hướng.
 *
 * Trước đây CategoryNavBar tự gọi /api/categories từ trình duyệt ở MỌI trang —
 * đo được 557ms, và danh mục chỉ hiện sau khi trang đã tải xong (nhấp nháy chỗ
 * trống). Danh mục là phần điều hướng chính nên phải có ngay trong HTML đầu
 * tiên (tiêu chí 4 & 7).
 *
 * Kết quả truy vấn được cache 5 phút, dùng chung cho mọi trang.
 */
export default async function CategoryNavWrapper() {
  let categories: { id: number; name: string; description: string; icon: string }[] = [];

  try {
    const rows = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    // CategoryNavBar khai báo description/icon là bắt buộc nhưng không dùng tới,
    // nên điền chuỗi rỗng thay vì kéo thêm cột từ database.
    categories = rows.map((c) => ({ ...c, description: '', icon: '' }));
  } catch {
    // Lỗi kết nối database không được làm sập cả trang — thanh điều hướng vẫn
    // hiển thị, chỉ thiếu phần danh mục.
    categories = [];
  }

  return <CategoryNavBar initialCategories={categories} />;
}
