import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contacts - Lấy danh sách liên hệ
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const [contacts, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactRequest.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Tạo liên hệ mới (từ form contact)
/*
 * Form gửi lên MÃ của chủ đề ("price-quote"), không phải nhãn tiếng Việt.
 * Nếu lưu nguyên mã thì trang quản trị hiện "Quan tâm: price-quote" — nhân
 * viên phải tự đoán nghĩa. Đổi sang nhãn ngay khi lưu (tiêu chí 1).
 */
const SUBJECT_LABELS: Record<string, string> = {
  'price-quote': 'Xin báo giá',
  'product-inquiry': 'Tư vấn chọn sản phẩm',
  'technical-support': 'Hỗ trợ kỹ thuật',
  'warranty': 'Bảo hành, sửa chữa',
  'collaboration': 'Hợp tác kinh doanh',
  'other': 'Nội dung khác',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, product, message } = body;

    // Xác thực phía server: không tin dữ liệu từ client (client có thể bị bỏ qua)
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!cleanName) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên' }, { status: 400 });
    }
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại' }, { status: 400 });
    }
    if (!/^(\+?84|0)\d{9,10}$/.test(cleanPhone.replace(/[\s.\-()]/g, ''))) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const contact = await prisma.contactRequest.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        email: typeof email === 'string' ? email.trim() : null,
        // Form trang chủ gửi "product", form trang liên hệ gửi "subject"
        product: (() => {
          const raw = (subject || product || '').toString().trim();
          return SUBJECT_LABELS[raw] ?? raw;
        })(),
        // Giới hạn độ dài để tránh ghi bản ghi quá lớn vào database
        message: typeof message === 'string' ? message.trim().slice(0, 2000) : '',
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Không gửi được thông tin liên hệ' },
      { status: 500 }
    );
  }
}
