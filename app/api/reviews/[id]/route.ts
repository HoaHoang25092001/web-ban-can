import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy đánh giá theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!review) {
      return NextResponse.json({ error: 'Không tìm thấy đánh giá' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Không thể lấy đánh giá' }, { status: 500 });
  }
}

// PUT: Cập nhật đánh giá (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reviewerName, content, rating, isVisible } = body;

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        ...(reviewerName !== undefined && { reviewerName }),
        ...(content !== undefined && { content }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(isVisible !== undefined && { isVisible }),
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Không thể cập nhật đánh giá' }, { status: 500 });
  }
}

// DELETE: Xóa đánh giá (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.review.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Không thể xóa đánh giá' }, { status: 500 });
  }
}
