import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/news/[id] - Lấy tin tức theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const newsItem = await prisma.news.findUnique({
      where: { id },
    });

    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newsItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// PUT /api/news/[id] - Cập nhật tin tức
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const { title, content, excerpt, image, published } = body;

    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        image,
        published,
      },
    });

    return NextResponse.json(newsItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[id] - Xóa tin tức
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
