import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách đánh giá (public - chỉ lấy isVisible=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all'); // admin dùng ?all=true để lấy tất cả

    const reviews = await prisma.review.findMany({
      where: all === 'true' ? {} : { isVisible: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Không thể lấy danh sách đánh giá' }, { status: 500 });
  }
}

// POST: Tạo đánh giá mới (chỉ admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewerName, content, rating, isVisible } = body;

    if (!reviewerName || !content) {
      return NextResponse.json({ error: 'Tên người đánh giá và nội dung là bắt buộc' }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Số sao phải từ 1 đến 5' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        reviewerName,
        content,
        rating: ratingNum,
        isVisible: isVisible !== false,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Không thể tạo đánh giá' }, { status: 500 });
  }
}
