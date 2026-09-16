import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/contacts/[id] - Cập nhật status liên hệ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const { status, note } = body;

    const VALID = ['new', 'processing', 'resolved'];
    if (status !== undefined && !VALID.includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    const data: { status?: string; note?: string | null; handledAt?: Date | null } = {};
    if (status !== undefined) {
      data.status = status;
      /*
       * Ghi lại mốc thời gian khi chuyển sang "Đã xử lý", và xoá đi nếu mở lại.
       * Nhờ đó đo được bao lâu sau khi khách gửi thì công ty phản hồi — con số
       * này mới cho biết luồng có chạy tốt hay không (tiêu chí 10).
       */
      data.handledAt = status === 'resolved' ? new Date() : null;
    }
    if (note !== undefined) {
      // Giới hạn độ dài để không ghi bản ghi quá lớn vào database.
      data.note = typeof note === 'string' ? note.trim().slice(0, 2000) || null : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Không có dữ liệu nào để cập nhật' },
        { status: 400 }
      );
    }

    const contact = await prisma.contactRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Xóa liên hệ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { id: idString } = await params;
    const id = parseInt(idString);

    await prisma.contactRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
