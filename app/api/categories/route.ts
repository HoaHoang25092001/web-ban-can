import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - Lấy danh sách categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      include: {
        products: includeProducts,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Tạo category mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
