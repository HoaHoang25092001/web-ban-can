import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/products - Lấy danh sách sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId);
    }
    
    if (featured === 'true') {
      where.featured = true;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    const [products, total, allProductsStats] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        select: {
          featured: true,
          images: true,
        },
      }),
    ]);

    const totalProductsCount = allProductsStats.length;
    const totalFeatured = allProductsStats.filter(p => p.featured).length;
    const totalMultiImage = allProductsStats.filter(p => p.images && p.images.length > 1).length;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalProducts: totalProductsCount,
        featuredProducts: totalFeatured,
        multiImageProducts: totalMultiImage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    // Nếu images được cung cấp, dùng ảnh đầu tiên làm image chính
    const primaryImage = image || (images && images.length > 0 ? images[0] : null);

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
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

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
