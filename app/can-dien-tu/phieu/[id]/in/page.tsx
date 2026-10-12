import { notFound, redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import { findOwnedTicket } from '@/lib/scale-ticket-server';
import PrintableTicket from '@/components/scale/PrintableTicket';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'In phiếu' };

/**
 * Trang in phiếu khổ A4.
 *
 * Không dùng khung ScaleShell (thanh menu, nút sáng/tối): trang này chỉ để
 * in, mọi thứ không nằm trên tờ giấy đều là thừa.
 */
export default async function PrintTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  const ticket = await findOwnedTicket(Number((await params).id), user.id);
  if (!ticket) notFound();

  const { auto } = await searchParams;

  return (
    <PrintableTicket
      autoPrint={auto === '1'}
      ticket={{
        ...ticket,
        type: ticket.type === 'NHAP' ? 'NHAP' : 'XUAT',
        createdAt: ticket.createdAt.toISOString(),
        completedAt: ticket.completedAt?.toISOString() ?? null,
      }}
    />
  );
}
