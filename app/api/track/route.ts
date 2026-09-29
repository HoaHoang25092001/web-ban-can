import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { regionLabel } from '@/lib/regions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Ghi nhận một lượt xem trang.
 *
 * Gọi từ trình duyệt khách (xem components/VisitTracker.tsx) chứ không làm
 * trong middleware: middleware của Next.js chạy trên Edge runtime, nơi Prisma
 * không kết nối được database thường.
 *
 * Trả về 204 và KHÔNG bao giờ báo lỗi ra ngoài: đây là việc phụ, hỏng thì
 * cũng không được ảnh hưởng tới trải nghiệm của khách đang xem hàng.
 */
export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json().catch(() => ({ path: null }));
    if (!path || typeof path !== 'string') {
      return new NextResponse(null, { status: 204 });
    }

    // Không ghi khu vực quản trị — đó là lượt của chính chủ shop, không phải khách.
    if (path.startsWith('/admin')) {
      return new NextResponse(null, { status: 204 });
    }

    /*
     * Vị trí lấy từ header Vercel tự gắn vào mỗi yêu cầu. Chạy ở máy cá nhân
     * thì không có header này nên để trống — đúng hơn là đoán bừa.
     */
    const country = request.headers.get('x-vercel-ip-country');
    const region = request.headers.get('x-vercel-ip-country-region');

    /*
     * Mã băm thay cho IP.
     *
     * Ghép IP với ngày rồi băm SHA-256: cùng một khách trong ngày cho ra cùng
     * một mã (đếm được khách duy nhất), nhưng sang ngày mới là mã khác nên
     * không lần theo một người qua thời gian được. Không thể đảo ngược ra IP.
     */
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const today = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash('sha256').update(`${ip}|${today}`).digest('hex').slice(0, 32);

    await prisma.pageView.create({
      data: {
        path: path.slice(0, 500),
        region,
        regionName: regionLabel(country, region),
        country,
        visitorHash,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Ghi log để còn biết mà sửa, nhưng vẫn trả về thành công cho khách.
    console.error('Không ghi được lượt truy cập:', error);
    return new NextResponse(null, { status: 204 });
  }
}
