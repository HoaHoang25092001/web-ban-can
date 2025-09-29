'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  capacity: string | null;
  accuracy: string | null;
  price: string | null;
  image: string | null;
  featured: boolean;
  category: {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailProps {
  productId: number | null;
  onClose: () => void;
}

export default function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getDefaultImage = (productName: string, categoryName: string) => {
    const query = encodeURIComponent(`${productName} ${categoryName} electronic scale weighing equipment professional`);
    return `https://readdy.ai/api/search-image?query=${query}&width=600&height=400&orientation=landscape`;
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'Liên hệ';
    return `${price}₫`;
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Lỗi: {error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}

          {product && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-w-16 aspect-h-12 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image || getDefaultImage(product.name, product.category.name)}
                    alt={product.name}
                    className="w-full h-80 object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultImage(product.name, product.category.name);
                    }}
                  />
                </div>
                
                {/* Category Badge */}
                <div className="flex items-center space-x-2">
                  {product.category.icon && (
                    <i className={`${product.category.icon} text-lg text-blue-600`}></i>
                  )}
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.category.name}
                  </span>
                  {product.featured && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      Nổi bật
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {product.capacity && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Khối lượng cân tối đa:</span>
                        <span className="text-gray-900 font-semibold">{product.capacity}</span>
                      </div>
                    )}
                    
                    {product.accuracy && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Độ chính xác:</span>
                        <span className="text-gray-900 font-semibold">{product.accuracy}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Danh mục:</span>
                      <span className="text-gray-900 font-semibold">{product.category.name}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Mô tả sản phẩm</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📞 Hotline: 0123 456 789</p>
                    <p>📧 Email: info@webcancban.com</p>
                    <p>🕒 Thời gian: 8:00 - 17:30 (T2-T7)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
