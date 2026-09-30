import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Trần số dòng cho một lần xuất, tránh dựng tệp quá lớn làm treo máy chủ. */
const MAX_ROWS = 20_000;

/**
 * Xuất bản ghi cân ra tệp Excel.
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
    const search = searchParams.get('search')?.trim();
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Cùng một cách dựng điều kiện với route danh sách, để tệp xuất ra khớp
    // với những gì khách đang nhìn thấy.
    const where: Record<string, unknown> = { userId: user.id };

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { employeeName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.gte = new Date(`${from}T00:00:00`);
      if (to) {
        const end = new Date(`${to}T00:00:00`);
        end.setDate(end.getDate() + 1);
        range.lt = end;
      }
      where.weighedAt = range;
    }

    const records = await prisma.weighingRecord.findMany({
      where,
      orderBy: { weighedAt: 'desc' },
      take: MAX_ROWS,
      select: {
        productCode: true,
        productName: true,
        weight: true,
        unit: true,
        employeeName: true,
        note: true,
        weighedAt: true,
      },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Cân Vạn Thịnh Phát';
    wb.created = new Date();

    const ws = wb.addWorksheet('Bản ghi cân');
    ws.columns = [
      { header: 'Thời gian cân', key: 'weighedAt', width: 20 },
      { header: 'Mã hàng', key: 'productCode', width: 16 },
      { header: 'Tên mặt hàng', key: 'productName', width: 32 },
      { header: 'Khối lượng', key: 'weight', width: 14 },
      { header: 'Đơn vị', key: 'unit', width: 10 },
      { header: 'Người cân', key: 'employeeName', width: 22 },
      { header: 'Ghi chú', key: 'note', width: 34 },
    ];

    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    header.alignment = { vertical: 'middle' };
    header.height = 22;

    // Khoá dòng tiêu đề và bật bộ lọc: sổ vài nghìn dòng mà cuộn xuống là mất
    // tiêu đề thì không biết cột nào là cột nào.
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = 'A1:G1';

    for (const r of records) {
      const row = ws.addRow({
        weighedAt: r.weighedAt,
        productCode: r.productCode,
        productName: r.productName,
        weight: r.weight,
        unit: r.unit,
        employeeName: r.employeeName ?? '',
        note: r.note ?? '',
      });
      /* Định dạng ngày và số ngay trong tệp: nếu để Excel tự đoán, cột thời
       * gian ra dạng số serial còn khối lượng mất số lẻ. */
      row.getCell('weighedAt').numFmt = 'dd/mm/yyyy hh:mm';
      row.getCell('weight').numFmt = '#,##0.000';
    }

    // Dòng tổng cộng ở cuối — thứ chủ xưởng cần nhất khi đối chiếu sổ sách.
    if (records.length > 0) {
      const totalRow = ws.addRow({
        productName: `TỔNG CỘNG (${records.length} lần cân)`,
        weight: records.reduce((s, r) => s + r.weight, 0),
        unit: records[0].unit,
      });
      totalRow.font = { bold: true };
      totalRow.getCell('weight').numFmt = '#,##0.000';
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
