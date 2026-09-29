import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

/** Khách được tính là "đang online" nếu có lượt xem trong 5 phút gần nhất. */
const ONLINE_WINDOW_MINUTES = 5;

/**
 * Thống kê truy cập cho trang Tổng quan.
 *
 * Gom tất cả vào MỘT truy vấn SQL bằng UNION ALL thay vì bốn lệnh riêng:
 * database đặt tại Mỹ nên mỗi lượt đi-về tốn ~0,5s, bốn lượt là hơn hai giây
 * chờ mỗi lần mở trang Tổng quan (tiêu chí 7).
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const since = new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60_000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totals, regions] = await Promise.all([
      prisma.$queryRaw<Array<{ kind: string; n: bigint }>>`
        SELECT 'online' AS kind, COUNT(DISTINCT "visitorHash") AS n
          FROM page_views WHERE "createdAt" >= ${since}
        UNION ALL
        SELECT 'total', COUNT(*) FROM page_views
        UNION ALL
        SELECT 'today', COUNT(*) FROM page_views WHERE "createdAt" >= ${startOfToday}
        UNION ALL
        SELECT 'todayVisitors', COUNT(DISTINCT "visitorHash")
          FROM page_views WHERE "createdAt" >= ${startOfToday}
      `,
      /* Gom theo tỉnh, lấy 20 tỉnh nhiều lượt nhất. Đếm cả lượt xem lẫn số
       * khách khác nhau: 1000 lượt từ 3 khách khác hẳn 1000 lượt từ 800 khách. */
      prisma.$queryRaw<Array<{ region_name: string; views: bigint; visitors: bigint }>>`
        SELECT COALESCE("regionName", 'Không xác định') AS region_name,
               COUNT(*) AS views,
               COUNT(DISTINCT "visitorHash") AS visitors
          FROM page_views
         GROUP BY 1
         ORDER BY views DESC
         LIMIT 20
      `,
    ]);

    const pick = (k: string) => Number(totals.find((t) => t.kind === k)?.n ?? 0);

    return NextResponse.json({
      online: pick('online'),
      total: pick('total'),
      today: pick('today'),
      todayVisitors: pick('todayVisitors'),
      onlineWindowMinutes: ONLINE_WINDOW_MINUTES,
      byRegion: regions.map((r) => ({
        name: r.region_name,
        views: Number(r.views),
        visitors: Number(r.visitors),
      })),
    });
  } catch (error) {
    console.error('Không tải được thống kê truy cập:', error);
    return NextResponse.json({ error: 'Không tải được thống kê truy cập' }, { status: 500 });
  }
}
