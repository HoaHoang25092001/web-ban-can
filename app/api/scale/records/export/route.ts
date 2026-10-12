import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { lineWhere } from '@/lib/scale-ticket-server';
import { TICKET_TYPE_LABEL, type TicketType } from '@/lib/scale-ticket';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Trần số dòng cho một lần xuất, tránh dựng tệp quá lớn làm treo máy chủ. */
const MAX_ROWS = 20_000;

/**
 * Xuất bản ghi cân (mọi lượt cân trong các phiếu) ra tệp Excel.
 *
 * Nhận ĐÚNG bộ lọc mà khách đang xem trên màn hình (tìm kiếm, khoảng ngày):
 * bản gốc xuất toàn bộ bất kể đang lọc gì, nên khách lọc ra 30 dòng của tháng
 * này rồi bấm xuất lại nhận về cả nghìn dòng của mọi tháng (tiêu chí 8).
 */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { searchParams } = new URL(request.url);
    // Cùng điều kiện với trang danh sách, để tệp xuất ra khớp với những gì
    // khách đang nhìn thấy.
    const records = await prisma.scaleTicketLine.findMany({
      where: lineWhere(user.id, searchParams),
      orderBy: [{ weighedAt: 'desc' }, { id: 'desc' }],
      take: MAX_ROWS,
      include: { ticket: { select: { ticketNo: true, type: true, customerName: true, vehiclePlate: true } } },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cân Vạn Thịnh Phát';
    wb.created = new Date();

    const ws = wb.addWorksheet('Bản ghi cân');
    ws.columns = [
      { header: 'Thời gian cân', key: 'weighedAt', width: 18 },
      { header: 'Số phiếu', key: 'ticketNo', width: 10 },
      { header: 'Loại phiếu', key: 'type', width: 11 },
      { header: 'Khách hàng', key: 'customer', width: 30 },
      { header: 'Số xe', key: 'plate', width: 13 },
      { header: 'Mã hàng', key: 'productCode', width: 12 },
      { header: 'Loại hàng', key: 'productName', width: 26 },
      { header: 'TL cân (kg)', key: 'gross', width: 12 },
      { header: 'Số khay', key: 'trays', width: 9 },
      { header: 'Trừ bì (kg)', key: 'tare', width: 12 },
      { header: 'TL hàng (kg)', key: 'net', width: 13 },
      { header: 'Đơn giá (đ/kg)', key: 'price', width: 14 },
      { header: 'Thành tiền (đ)', key: 'amount', width: 16 },
    ];

    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    header.alignment = { vertical: 'middle' };
    header.height = 22;

    // Khoá dòng tiêu đề và bật bộ lọc: sổ vài nghìn dòng mà cuộn xuống là mất
    // tiêu đề thì không biết cột nào là cột nào.
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = 'A1:M1';

    const KG = '#,##0.###';
    const VND = '#,##0';
    for (const r of records) {
      const row = ws.addRow({
        // Excel không có múi giờ: ghi sẵn giờ Việt Nam, nếu không máy chủ (giờ
        // UTC) sẽ ghi 23:00 hôm trước cho lượt cân lúc 6 giờ sáng.
        weighedAt: new Date(r.weighedAt.getTime() + 7 * 3600_000),
        ticketNo: r.ticket.ticketNo,
        type: TICKET_TYPE_LABEL[r.ticket.type as TicketType] ?? r.ticket.type,
        customer: r.ticket.customerName ?? '',
        plate: r.ticket.vehiclePlate ?? '',
        productCode: r.productCode,
        productName: r.productName,
        gross: r.grossWeight,
        trays: r.trayCount,
        tare: r.tareWeight,
        net: r.netWeight,
        price: r.unitPrice,
        amount: r.amount,
      });
      /* Định dạng ngày và số ngay trong tệp: nếu để Excel tự đoán, cột thời
       * gian ra dạng số serial còn khối lượng mất số lẻ. */
      row.getCell('weighedAt').numFmt = 'dd/mm/yyyy hh:mm';
      for (const k of ['gross', 'tare', 'net']) row.getCell(k).numFmt = KG;
      for (const k of ['price', 'amount']) row.getCell(k).numFmt = VND;
    }

    // Dòng tổng cộng ở cuối — thứ chủ xưởng cần nhất khi đối chiếu sổ sách.
    if (records.length > 0) {
      const totalRow = ws.addRow({
        productName: `TỔNG CỘNG (${records.length} lượt cân)`,
        trays: records.reduce((s, r) => s + r.trayCount, 0),
        net: records.reduce((s, r) => s + r.netWeight, 0),
        amount: records.reduce((s, r) => s + r.amount, 0),
      });
      totalRow.font = { bold: true };
      totalRow.getCell('net').numFmt = KG;
      totalRow.getCell('amount').numFmt = VND;
      totalRow.border = { top: { style: 'double' } };
    }

    const buffer = await wb.xlsx.writeBuffer();

    /*
     * Tên tệp có ngày giờ để tải nhiều lần không bị đè lên nhau trong thư mục
     * Downloads. Chỉ dùng chữ không dấu: tên tệp tiếng Việt có dấu bị một số
     * trình duyệt và Windows mã hoá thành chuỗi khó đọc.
     */
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const filename = `ban-ghi-can-${stamp}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Không xuất được tệp Excel:', error);
    return NextResponse.json({ error: 'Không xuất được tệp Excel' }, { status: 500 });
  }
}
