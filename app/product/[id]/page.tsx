import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });
    if (!product) return { title: 'Không tìm thấy sản phẩm - Vạn Thịnh Phát' };
    return {
      title: `${product.name} - Giá tốt chính hãng`,
      description: product.description || `Mua ngay ${product.name} chất lượng cao, có kiểm định, bảo hành chính hãng từ Vạn Thịnh Phát.`
    };
  } catch {
    return { title: 'Chi tiết sản phẩm - Vạn Thịnh Phát' };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-scale-in">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Lỗi tải sản phẩm</h1>
          <p className="text-slate-600 mb-6">ID sản phẩm không hợp lệ.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Tải trực tiếp dữ liệu từ database trên server
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-scale-in">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Lỗi tải sản phẩm</h1>
          <p className="text-slate-600 mb-6">Không tìm thấy thông tin sản phẩm này hoặc sản phẩm đã bị xóa.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Tải các sản phẩm liên quan trong cùng danh mục
  const relatedProductsRaw = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  // Serialize dữ liệu để an toàn khi truyền qua Client Component boundary
  const productSerialized = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images || [],
    category: {
      ...product.category,
      createdAt: product.category.createdAt.toISOString(),
      updatedAt: product.category.updatedAt.toISOString()
    }
  };

  const relatedProductsSerialized = relatedProductsRaw.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    images: item.images || [],
    category: {
      ...item.category,
      createdAt: item.category.createdAt.toISOString(),
      updatedAt: item.category.updatedAt.toISOString()
    }
  }));

  return (
    <ProductDetailClient 
      product={productSerialized} 
      relatedProducts={relatedProductsSerialized} 
    />
  );
}