import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { vnDayStart } from '@/lib/scale-ticket';

/** Cắt chuỗi, chuỗi rỗng thành null. */
export function optionalText(value: unknown, max: number) {
  const s = String(value ?? '').trim();
  return s ? s.slice(0, max) : null;
}

/**
 * Mã khách kế tiếp dạng KH00001, KH00002…
 *
 * Người cân thường không muốn tự nghĩ mã — để trống là hệ thống tự đánh. Lấy
 * số lớn nhất đang có rồi cộng một, chứ không đếm số khách: xoá một khách ở
 * giữa thì đếm lại sẽ ra mã trùng với khách cuối.
 */
export async function nextCustomerCode(userId: number) {
  const rows = await prisma.scaleCustomer.findMany({
    where: { userId, code: { startsWith: 'KH' } },
    select: { code: true },
  });
  const max = rows.reduce((m, r) => {
    const n = Number(r.code.slice(2));
    return Number.isInteger(n) && n > m ? n : m;
  }, 0);
  return `KH${String(max + 1).padStart(5, '0')}`;
}

/**
 * Lấy phiếu kèm các lượt cân — CHỈ khi phiếu thuộc tài khoản đang đăng nhập.
 *
 * Mọi route và trang in đều đi qua hàm này, không tự viết findUnique(id):
 * quên điều kiện userId ở một chỗ là khách đổi số trên thanh địa chỉ đọc được
 * phiếu (kèm tên, số điện thoại khách hàng) của công ty khác.
 */
export function findOwnedTicket(id: number, userId: number) {
  if (!Number.isInteger(id) || id <= 0) return Promise.resolve(null);
  return prisma.scaleTicket.findFirst({
    where: { id, userId },
    include: { lines: { orderBy: [{ weighedAt: 'asc' }, { id: 'asc' }] } },
  });
}

export type OwnedTicket = NonNullable<Awaited<ReturnType<typeof findOwnedTicket>>>;

/**
 * Điều kiện lọc lượt cân cho trang Bản ghi cân và tệp Excel.
 *
 * Dùng chung một hàm cho cả danh sách lẫn xuất Excel: dựng hai nơi thì sớm
 * muộn lệch nhau, khách lọc ra 30 dòng mà tệp tải về lại khác.
 *
 * Lượt cân không có userId riêng — lọc qua phiếu chứa nó (`ticket.userId`).
 */
export function lineWhere(userId: number, searchParams: URLSearchParams): Prisma.ScaleTicketLineWhereInput {
  const search = searchParams.get('search')?.trim();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const weighedAt: Prisma.DateTimeFilter = {};
  if (from && DATE_RE.test(from)) weighedAt.gte = vnDayStart(from);
  if (to && DATE_RE.test(to)) weighedAt.lt = new Date(vnDayStart(to).getTime() + 86400_000);

  const ticketNo = search && /^#?\d+$/.test(search) ? Number(search.replace('#', '')) : null;

  return {
    ticket: { userId },
    ...(weighedAt.gte || weighedAt.lt ? { weighedAt } : {}),
    ...(search
      ? {
          OR: [
            { productName: { contains: search, mode: 'insensitive' } },
            { productCode: { contains: search, mode: 'insensitive' } },
            { ticket: { customerName: { contains: search, mode: 'insensitive' } } },
            { ticket: { vehiclePlate: { contains: search, mode: 'insensitive' } } },
            ...(ticketNo !== null ? [{ ticket: { ticketNo } }] : []),
          ],
        }
      : {}),
  };
}
