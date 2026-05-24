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
  const imageUrl = product.image && product.image.trim() !== ''
    ? (product.image.startsWith('/') ? `http://localhost:3000${product.image}` : product.image)
    : null;

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
        {/* Image area */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 20))}`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="ri-image-line text-5xl text-gray-300"></i>
            </div>
          )}
        </div>

        {/* Info area */}
        <div className="p-1">
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1 min-h-[2.5rem]">
            {product.name}
          </h4>
          <p className="text-lg font-medium text-red-500">Giá: {''}
            {product.price && product.price.trim() !== '' && product.price.toLowerCase() !== 'liên hệ'
              ? product.price.includes('VNĐ') ? product.price : `${product.price}`
              : 'Liên hệ'}
          </p>
        </div>
      </div>
    </Link>
  );
}
