'use client';

import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  capacity: string;
  accuracy: string;
  price: string;
  image: string;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export default function ProductCard({ product, showCategory = false }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative w-full h-64 overflow-hidden bg-gray-200">
        {product.image && product.image.trim() !== '' ? (
          <img
            src={product.image.startsWith('/') ? `http://localhost:3000${product.image}` : product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 20))}`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-image-line text-4xl text-gray-400"></i>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-2 flex gap-2">
          {product.featured && (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              Nổi bật
            </span>
          )}
          {showCategory && (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
              {product.category.name}
            </span>
          )}
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h4>
        <div className="mb-4 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cân nặng:</span> {product.capacity}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Độ chính xác:</span> {product.accuracy}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {product.price.includes('VNĐ') ? product.price : `${product.price} VNĐ`}
          </span>
          <Link 
            href={`/product/${product.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Xem Chi Tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
