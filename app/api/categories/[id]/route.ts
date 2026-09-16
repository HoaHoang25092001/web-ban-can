import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories/[id] - Lấy category theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Cập nhật category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const { name, description, icon, showOnHome, homeOrder } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        // Chỉ ghi khi client thực sự gửi lên, tránh vô tình đặt lại về mặc định.
        ...(typeof showOnHome === 'boolean' ? { showOnHome } : {}),
        ...(Number.isFinite(Number(homeOrder)) ? { homeOrder: Number(homeOrder) } : {}),
        name,
        description,
        icon,
      },
    });

    // Làm mới trang chủ ngay (xem chú thích ở POST /api/categories).
    revalidatePath('/');
    revalidateTag('products');
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Xóa category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    // Kiểm tra xem có products nào thuộc category này không
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    // Làm mới trang chủ ngay (xem chú thích ở POST /api/categories).
    revalidatePath('/');
    revalidateTag('products');
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
