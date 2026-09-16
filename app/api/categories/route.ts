import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - Lấy danh sách categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      // Đếm bằng COUNT(*) thay vì tải hết bản ghi sản phẩm về rồi .length.
      ...(includeProducts ? { include: { _count: { select: { products: true } } } } : {}),
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
    const { name, description, icon, showOnHome, homeOrder } = body;

    const category = await prisma.category.create({
      data: {
        // Hai trường điều khiển hiển thị trên trang chủ. Mặc định bật để danh
        // mục mới tạo vẫn xuất hiện mà không phải nhớ chỉnh thêm.
        showOnHome: typeof showOnHome === 'boolean' ? showOnHome : true,
        homeOrder: Number.isFinite(Number(homeOrder)) ? Number(homeOrder) : 0,
        name,
        description,
        icon,
      },
    });

    /* Làm mới trang chủ ngay.
     * Trang chủ cache 5 phút theo thời gian (revalidate = 300). Không có dòng
     * này thì bật/tắt danh mục xong phải chờ tới 5 phút mới thấy thay đổi —
     * người quản trị tưởng thao tác không ăn (tiêu chí 7). */
    revalidatePath('/');
    revalidateTag('products');
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
