'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, Clock, Star, Package, Gauge, ZoomIn, X, Scale, Ruler, Factory, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RichContentDisplay from '@/components/RichContentDisplay';
import ProductCategorySidebar from '@/components/ProductCategorySidebar';

interface Product {
  id: number;
  name: string;
  description: string | null;
  capacity: string | null;
  accuracy: string | null;
  price: string | null;
  image: string | null;
  featured: boolean;
  dialSize: string | null;
  scaleSize: string | null;
  manufacturer: string | null;
  origin: string | null;
  category: {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
        
        // Lấy sản phẩm liên quan cùng danh mục
        if (data.category?.id) {
          const relatedResponse = await fetch(`/api/products?categoryId=${data.category.id}&limit=6`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Lọc bỏ sản phẩm hiện tại và chỉ lấy tối đa 4 sản phẩm
            const filtered = relatedData.products
              ?.filter((p: Product) => p.id !== data.id)
              .slice(0, 4) || [];
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const getDefaultImage = (productName: string, categoryName: string) => {
    const query = encodeURIComponent(`${productName} ${categoryName} electronic scale weighing equipment professional`);
    return `https://readdy.ai/api/search-image?query=${query}&width=800&height=600&orientation=landscape`;
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'Liên hệ';
    return `${price}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi tải sản phẩm</h1>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy sản phẩm'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href={`/category/${product.category.id}`} className="hover:text-blue-600 transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 px-4 lg:px-6 py-8">
        {/* Sidebar */}
        <ProductCategorySidebar />

        {/* Content */}
        <div className="flex-1 w-full min-w-0">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-xl bg-white shadow-lg">
              <Image
                src={product.image || getDefaultImage(product.name, product.category.name)}
                alt={product.name}
                width={800}
                height={600}
                className="w-full h-96 object-contain object-center p-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultImage(product.name, product.category.name);
                }}
              />
            </div>
            
            {/* Button xem hình lớn */}
            <button
              onClick={() => setShowImageModal(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <ZoomIn className="w-5 h-5" />
              Click vào đây để xem hình lớn
            </button>
            
            {/* Category and Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {product.category.icon && (
                  <i className={`${product.category.icon} text-lg text-blue-600`}></i>
                )}
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full">
                  {product.category.name}
                </span>
              </div>
              {product.featured && (
                <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm font-medium px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  Nổi bật
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Contact Info - Moved Up */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Thông tin liên hệ</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">Hotline:</span>
                  <a href="tel:0123456789" className="ml-2 text-blue-600 hover:text-blue-700 font-semibold">
                    0123 456 789
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">Email:</span>
                  <a href="mailto:info@webcancban.com" className="ml-2 text-blue-600 hover:text-blue-700 font-semibold">
                    info@webcancban.com
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium">Thời gian:</span>
                  <span className="ml-2 font-semibold">8:00 - 17:30 (T2-T7)</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Liên hệ tư vấn
                </Link>
              </div>
            </div>
              </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-600" />
                    Sản phẩm liên quan
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <Link 
                        key={relatedProduct.id} 
                        href={`/product/${relatedProduct.id}`}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                          <Image
                            src={relatedProduct.image || getDefaultImage(relatedProduct.name, relatedProduct.category.name)}
                            alt={relatedProduct.name}
                            width={300}
                            height={225}
                            className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getDefaultImage(relatedProduct.name, relatedProduct.category.name);
                            }}
                          />
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relatedProduct.name}
                          </h4>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {relatedProduct.category.name}
                            </span>
                            {relatedProduct.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          
                          <div className="text-blue-600 font-bold text-sm">
                            {formatPrice(relatedProduct.price)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Specifications - Full Width Section Below */}
            <div className="mt-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              Thông số kỹ thuật
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.capacity && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Scale className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Khối lượng cân tối đa:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.capacity}</span>
                </div>
              )}
              
              {product.accuracy && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Độ chính xác:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.accuracy}</span>
                </div>
              )}
              
              {product.dialSize && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Ruler className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Kích thước dia:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.dialSize}</span>
                </div>
              )}
              
              {product.scaleSize && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Ruler className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Kích thước cân:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.scaleSize}</span>
                </div>
              )}
              
              {product.manufacturer && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Factory className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Sản xuất:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.manufacturer}</span>
                </div>
              )}
              
              {product.origin && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Xuất xứ:</span>
                  </div>
                  <span className="text-gray-900 font-bold text-lg">{product.origin}</span>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-gray-600 font-medium text-sm">Danh mục:</span>
                </div>
                <span className="text-blue-700 font-bold text-lg">{product.category.name}</span>
              </div>
                </div>
              </div>
            </div>

            {/* Description - Full Width Section */}
            {product.description && (
              <div className="mt-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-600" />
                    Mô tả sản phẩm
                  </h3>
                  <div className="max-w-none">
                    <RichContentDisplay content={product.description} />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
            }}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Đóng"
          >
            <X className="w-8 h-8 text-white" />
          </button>
          
          <div className="max-w-7xl max-h-full flex items-center justify-center">
            <Image
              src={product.image || getDefaultImage(product.name, product.category.name)}
              alt={product.name}
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultImage(product.name, product.category.name);
              }}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white text-sm">Click bất kỳ đâu để đóng</p>
          </div>
        </div>
      )}
    </div>
  );
}