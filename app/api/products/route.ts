import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

const MAX_LIMIT = 60;

// GET /api/products - Lấy danh sách sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    // Thống kê chỉ cần cho trang admin — mặc định không tính để API public nhẹ
    const withStats = searchParams.get('withStats') === 'true';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    // Chặn limit quá lớn để một request không kéo cả bảng về
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || '10') || 10)
    );
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (categoryId && categoryId !== 'all') {
      const parsed = parseInt(categoryId);
      if (!Number.isNaN(parsed)) where.categoryId = parsed;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    /**
     * Trước đây phần thống kê gọi findMany() lấy TOÀN BỘ bảng products rồi
     * đếm trong JavaScript — mỗi request public đều kéo cả bảng về, chậm dần
     * theo số sản phẩm. Nay dùng count() ở tầng database và chỉ tính khi được
     * yêu cầu rõ ràng.
     */
    let stats;
    if (withStats) {
      /*
       * Gộp cả 3 con số vào MỘT truy vấn.
       *
       * Bản trước chạy 3 lệnh count riêng. Mỗi lệnh chỉ mất ~0,02s ở database
       * nhưng phải đi vòng tới Neon (đặt tại Mỹ) mất ~0,5s độ trễ mạng — nên
       * tổng thời gian gần như bằng 3 lần độ trễ chứ không phải do đếm chậm.
       * Một truy vấn duy nhất chỉ tốn một lần đi-về.
       */
      const [row] = await prisma.$queryRaw<Array<{
        total: bigint; featured: bigint; multi_image: bigint;
      }>>`
        SELECT
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (WHERE featured)::bigint AS featured,
          COUNT(*) FILTER (WHERE array_length(images, 1) > 1)::bigint AS multi_image
        FROM products
      `;
      stats = {
        totalProducts: Number(row?.total ?? 0),
        featuredProducts: Number(row?.featured ?? 0),
        multiImageProducts: Number(row?.multi_image ?? 0),
      };
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      ...(stats ? { stats } : {}),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Không tải được danh sách sản phẩm' },
      { status: 500 }
    );
  }
}

// POST /api/products - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      capacity,
      accuracy,
      price,
      image,
      images,
      featured,
      dialSize,
      scaleSize,
      manufacturer,
      origin
    } = body;

    // Kiểm tra dữ liệu bắt buộc trước khi ghi (tránh lỗi 500 khó hiểu)
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });
    }
    const parsedCategoryId = parseInt(categoryId);
    if (Number.isNaN(parsedCategoryId)) {
      return NextResponse.json({ error: 'Danh mục không hợp lệ' }, { status: 400 });
    }

    // Nếu images được cung cấp, dùng ảnh đầu tiên làm image chính
    const primaryImage = image || (images && images.length > 0 ? images[0] : null);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description,
        categoryId: parsedCategoryId,
        capacity,
        accuracy,
        price,
        image: primaryImage,
        images: images || [],
        featured: featured || false,
        dialSize,
        scaleSize,
        manufacturer,
        origin,
      },
      include: {
        category: true,
      },
    });

    /* Xoá cache đếm sản phẩm theo danh mục.
     * Cache này sống 1 tiếng (xem app/category/[id]/page.tsx). Không xoá thì
     * số "N sản phẩm" trên trang danh mục giữ giá trị cũ suốt 1 tiếng sau khi
     * thêm/sửa/xoá hàng — khách và cả người quản trị đều thấy con số sai
     * (tiêu chí 7). */
    revalidateTag('products');
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Không tạo được sản phẩm' },
      { status: 500 }
    );
  }
}
