import { redirect } from 'next/navigation';

/**
 * Địa chỉ cũ của Phiếu cân. Phiếu cân nay là trang chính /can-dien-tu; giữ
 * trang này để đường dẫn đã lưu, đã gửi qua Zalo vẫn mở đúng phiếu.
 */
export default async function OldTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; khach?: string }>;
}) {
  const { id, khach } = await searchParams;
  const qs = new URLSearchParams();
  if (id) qs.set('id', id);
  if (khach) qs.set('khach', khach);
  redirect(qs.size ? `/can-dien-tu?${qs}` : '/can-dien-tu');
}
