import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/news - Lấy danh sách tin tức
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (published === 'true') {
      where.published = true;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        /*
         * Không lấy cột `content`: bảng quản trị và các thẻ tin tức chỉ cần
         * tiêu đề, tóm tắt, ảnh và trạng thái. Mỗi bài dài ~6.000 ký tự nên
         * với limit=100 sẽ là ~559 KB tải về rồi bỏ đi (tiêu chí 7).
         * Trang xem/sửa chi tiết gọi /api/news/[id] và vẫn nhận đủ content.
         */
        select: {
          id: true,
          title: true,
          excerpt: true,
          image: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST /api/news - Tạo tin tức mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, image, published } = body;

    const newsItem = await prisma.news.create({
      data: {
        title,
        content,
        excerpt,
        image,
        published: published || false,
      },
    });

    return NextResponse.json(newsItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}
