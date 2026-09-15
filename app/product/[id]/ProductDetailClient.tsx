'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, Star, Package, Gauge, 
  ZoomIn, X, Scale, Ruler, Factory, MapPin, ChevronLeft, 
  ChevronRight, ShieldCheck, Truck, RotateCcw, Headphones, 
  Check, Send, Sparkles, MessageSquare, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RichContentDisplay from '@/components/RichContentDisplay';
import { IMAGE_PLACEHOLDER, isOptimizableImage } from '@/lib/image';
import { BUSINESS, telHref } from '@/lib/site';

// Link chat Zalo dựng từ hotline chính trong lib/site.ts
const ZALO_URL = `https://zalo.me/${BUSINESS.phones[0].replace(/\./g, '')}`;

interface Product {
  id: number;
  name: string;
  description: string | null;
  capacity: string | null;
  accuracy: string | null;
  price: string | null;
  image: string | null;
  images: string[];
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

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'policy'>('description');
  
  const formRef = useRef<HTMLDivElement>(null);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    note: ''
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [quoteErrors, setQuoteErrors] = useState<{ name?: string; phone?: string }>({});

  // Khóa cuộn trang khi mở modal và bắt sự kiện bàn phím Escape để đóng modal
  useEffect(() => {
    if (showImageModal) {
      // Khóa cuộn body
      document.body.style.overflow = 'hidden';

      // Lắng nghe phím Esc
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowImageModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showImageModal]);

  /**
   * Ảnh thay thế khi sản phẩm chưa có hình.
   * Trước đây gọi sang https://readdy.ai để sinh ảnh minh họa: phụ thuộc dịch vụ
   * ngoài, tải chậm và có thể trả về ảnh không đúng sản phẩm. Nay dùng ảnh SVG
   * nội bộ, hiển thị tức thì và không lệ thuộc mạng bên thứ ba.
   */
  const getDefaultImage = () => IMAGE_PLACEHOLDER;

  const formatPrice = (price: string | null) => {
    if (!price || price.toLowerCase().trim() === 'liên hệ') return 'Liên hệ báo giá';
    return price;
  };

  const getAllImages = () => {
    const imgs: string[] = [];
    
    if (product.image) {
      imgs.push(product.image);
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !imgs.includes(img)) {
          imgs.push(img);
        }
      });
    }
    
    if (imgs.length === 0) {
      imgs.push(getDefaultImage());
    }
    
    return imgs;
  };

  const allImages = getAllImages();

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const scrollToQuoteForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /**
     * Xác thực ngay tại chỗ, hiển thị lỗi cạnh từng ô nhập (tiêu chí 8).
     * Bản trước dùng alert() — hộp thoại này chặn toàn trang, không nói rõ ô nào
     * sai và biến mất ngay khi bấm OK nên người dùng phải tự đoán.
     */
    const nextErrors: { name?: string; phone?: string } = {};
    if (!quoteForm.name.trim()) {
      nextErrors.name = 'Vui lòng nhập họ và tên.';
    }
    const phone = quoteForm.phone.trim().replace(/[\s.\-()]/g, '');
    if (!quoteForm.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại để chúng tôi gọi lại.';
    } else if (!/^(\+?84|0)\d{9,10}$/.test(phone)) {
      nextErrors.phone = 'Số điện thoại chưa đúng. Ví dụ hợp lệ: 0326711476.';
    }

    setQuoteErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(nextErrors.name ? 'quote-name' : 'quote-phone')?.focus();
      return;
    }

    setIsSubmittingQuote(true);
    setQuoteStatus('idle');

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: quoteForm.name,
          phone: quoteForm.phone,
          email: quoteForm.email,
          subject: product.name,
          message: quoteForm.note || `Yêu cầu báo giá nhanh cho sản phẩm: ${product.name}`,
        }),
      });

      if (response.ok) {
        setQuoteStatus('success');
        setQuoteForm({
          name: '',
          phone: '',
          email: '',
          note: ''
        });
      } else {
        setQuoteStatus('error');
      }
    } catch (err) {
      console.error(err);
      setQuoteStatus('error');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 lg:pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center space-x-2 text-xs md:text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors inline-flex items-center min-h-touch gap-1">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <Link href={`/category/${product.category.id}`} className="hover:text-blue-600 transition-colors inline-flex items-center min-h-touch">
              {product.category.name}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center min-h-touch text-sm font-semibold text-slate-600 hover:text-blue-600 mb-4 group transition-colors animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group aspect-w-4 aspect-h-3 overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300">
              
              <div 
                className="w-full h-96 md:h-[520px] flex items-center justify-center p-4 cursor-zoom-in"
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={allImages[activeImageIndex]}
                  alt={`${product.name} - Ảnh ${activeImageIndex + 1}`}
                  width={800}
                  height={600}
                  priority
                  unoptimized={!isOptimizableImage(allImages[activeImageIndex])}
                  className="w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultImage();
                  }}
                />
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span className="inline-flex items-center bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  {product.category.name}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Nổi bật
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-4 right-4 p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
                title="Phóng to hình ảnh"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md border border-slate-100 active:scale-90 transition-all"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md border border-slate-100 active:scale-90 transition-all"
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1 scrollable-content">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-16 bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                      idx === activeImageIndex
                        ? 'border-blue-600 ring-2 ring-blue-600/20 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      unoptimized={!isOptimizableImage(img)}
                      className="object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultImage();
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-center text-xs text-slate-400 font-medium">
              * Click vào ảnh chính hoặc nút zoom để phóng to xem chi tiết
            </p>
          </div>

          <div className="lg:col-span-5 space-y-6 md:space-y-8 animate-fade-in">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Mã SP: CAN-{product.id.toString().padStart(4, '0')}</span>
                <span>•</span>
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <ShieldCheck className="w-4 h-4" /> Đã kiểm định chất lượng
                </span>
              </div>
            </div>

            {/*
              ĐÃ GỠ phần "Giá cũ": bản trước lấy giá thật nhân 1.15 rồi gạch ngang
              để tạo cảm giác đang giảm 15% — mức giá đó chưa từng tồn tại, đây là
              quảng cáo sai sự thật và vi phạm quy định về khuyến mại.
              Chỉ hiển thị giá thật kèm lưu ý VAT đúng như công ty công bố.
            */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50/50 border-l-4 border-blue-600 rounded-r-2xl p-5 md:p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">Giá tham khảo</span>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className={`text-2xl md:text-3xl font-black ${product.price && product.price.toLowerCase().trim() !== 'liên hệ' ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatPrice(product.price)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                {BUSINESS.priceNote}. Giá cuối cùng phụ thuộc cấu hình và số lượng —
                vui lòng liên hệ để nhận báo giá chính xác.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> Thông số nổi bật
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {product.capacity && (
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mức cân tối đa</p>
                      <p className="text-sm font-extrabold text-slate-800">{product.capacity}</p>
                    </div>
                  </div>
                )}
                
                {product.accuracy && (
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg flex-shrink-0">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Độ chính xác (Sai số)</p>
                      <p className="text-sm font-extrabold text-slate-800">{product.accuracy}</p>
                    </div>
                  </div>
                )}

                {product.manufacturer && (
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg flex-shrink-0">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hãng sản xuất</p>
                      <p className="text-sm font-extrabold text-slate-800">{product.manufacturer}</p>
                    </div>
                  </div>
                )}

                {product.origin && (
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Xuất xứ</p>
                      <p className="text-sm font-extrabold text-slate-800">{product.origin}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-blue-400 animate-bounce" /> Tư vấn & Báo giá trực tiếp 24/7
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Hotline 1 (Zalo)</p>
                    <a href={telHref(BUSINESS.phones[0])} className="inline-flex items-center min-h-touch text-base font-extrabold text-white hover:text-blue-400 transition-colors mt-0.5">
                      {BUSINESS.phones[0]}
                    </a>
                    <span className="text-[11px] text-slate-400 font-medium block">Mr. Thịnh (Kỹ thuật)</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Hotline 2 (Zalo)</p>
                    <a href={telHref(BUSINESS.phones[1])} className="inline-flex items-center min-h-touch text-base font-extrabold text-white hover:text-pink-400 transition-colors mt-0.5">
                      {BUSINESS.phones[1]}
                    </a>
                    <span className="text-[11px] text-slate-400 font-medium block">Ms. Hằng (Kinh doanh)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat Zalo ngay
                </a>
                
                <button
                  onClick={scrollToQuoteForm}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Gửi yêu cầu báo giá
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm text-center">
                <ShieldCheck className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Chính hãng 100%</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Đầy đủ CO, CQ</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm text-center">
                <RotateCcw className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Bảo hành 1 năm</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Bảo trì trọn đời</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm text-center">
                <Truck className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Giao hàng toàn quốc</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Hỗ trợ lắp đặt</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm text-center">
                <Headphones className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Kỹ thuật 24/7</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Tư vấn chuyên nghiệp</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products - Full Width Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 md:mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" /> Sản phẩm liên quan khác
              </h2>
              <Link 
                href={`/category/${product.category.id}`}
                className="text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <Link 
                  key={p.id} 
                  href={`/product/${p.id}`}
                  className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative bg-slate-50 flex items-center justify-center h-40 md:h-48 overflow-hidden">
                    <Image
                      src={p.image || getDefaultImage()}
                      alt={p.name}
                      width={300}
                      height={225}
                      unoptimized={!isOptimizableImage(p.image)}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultImage();
                      }}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.category.name}</span>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
                      <span className={`text-xs font-extrabold ${p.price && p.price.toLowerCase().trim() !== 'liên hệ' ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatPrice(p.price)}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                        Chi tiết <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 md:mt-16 items-start">
          
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/80">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 px-6 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Mô tả chi tiết
              </button>
              
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex-1 py-4 px-6 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'specs'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Gauge className="w-4 h-4" />
                Thông số đầy đủ
              </button>

              <button
                onClick={() => setActiveTab('policy')}
                className={`flex-1 py-4 px-6 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'policy'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Chính sách mua hàng
              </button>
            </div>

            <div className="p-6 md:p-8">
              
              {activeTab === 'description' && (
                <div className="space-y-4">
                  {product.description ? (
                    <article className="prose max-w-none prose-slate prose-blue">
                      <RichContentDisplay content={product.description} />
                    </article>
                  ) : (
                    <div className="text-center py-8 text-slate-400 font-medium">
                      <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      Chưa có mô tả chi tiết cho sản phẩm này.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Thuộc tính</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thông số kỹ thuật chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-150">
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-blue-500" /> Khối lượng tối đa
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.capacity || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-blue-500" /> Độ chính xác (Sai số)
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.accuracy || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-blue-500" /> Kích thước đĩa cân
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.dialSize || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-blue-500" /> Kích thước cân
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.scaleSize || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Factory className="w-4 h-4 text-blue-500" /> Thương hiệu / Sản xuất
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.manufacturer || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" /> Xuất xứ thương hiệu
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.origin || 'Đang cập nhật'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-650 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" /> Danh mục sản phẩm
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{product.category.name}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'policy' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3.5">
                      <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="w-1.5 h-6 bg-blue-600 rounded"></span> Quy trình đặt hàng
                      </h4>
                      <ol className="space-y-2.5 text-sm text-slate-605 pl-4 list-decimal font-medium">
                        <li><strong>Chọn lựa sản phẩm:</strong> Quý khách xem sản phẩm, liên hệ hotline tư vấn để chốt dòng cân đúng thông số kỹ thuật.</li>
                        <li><strong>Nhận báo giá văn bản:</strong> Đội ngũ kinh doanh gửi báo giá có chữ ký và đóng dấu tròn công ty qua Zalo/Email.</li>
                        <li><strong>Thanh toán giao hàng:</strong> Xác nhận đặt hàng, chúng tôi tiến hành hiệu chuẩn kiểm tra cân trước khi đóng gói gửi chành xe/bưu điện hoặc trực tiếp bàn giao giao hàng.</li>
                      </ol>
                    </div>

                    <div className="space-y-3.5">
                      <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="w-1.5 h-6 bg-emerald-600 rounded"></span> Cam kết & Bảo hành chính hãng
                      </h4>
                      <ul className="space-y-2.5 text-sm text-slate-605 pl-4 list-disc font-medium">
                        <li>Cam kết toàn bộ sản phẩm nhập khẩu nguyên đai nguyên kiện, mới 100%.</li>
                        <li>Bảo hành từ 12 - 24 tháng theo đúng tiêu chuẩn nhà sản xuất quốc tế.</li>
                        <li>Đội ngũ kỹ thuật hỗ trợ sửa chữa, bảo trì sau thời gian bảo hành với chi phí ưu đãi nhất.</li>
                        <li>Đổi mới sản phẩm trong vòng 7 ngày đầu nếu phát hiện lỗi do nhà sản xuất.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-150 flex gap-4 mt-6 items-start">
                    <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-blue-900 text-sm mb-1">Dịch vụ hiệu chuẩn cân (Calibration Service)</h5>
                      <p className="text-xs text-blue-800 leading-relaxed font-medium">
                        Chúng tôi hỗ trợ hiệu chuẩn cân mẫu bằng quả cân chuẩn F1, M1 đạt chuẩn đo lường Việt Nam trước khi xuất kho giao tới tay khách hàng. Đảm bảo cân hoạt động chính xác tuyệt đối, giảm thiểu tối đa sai lệch trong quá trình cân đo kiểm nghiệm sản xuất.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div ref={formRef} className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white border border-slate-200/60 shadow-lg rounded-2xl overflow-hidden p-6 md:p-7 space-y-6">
              
              <div className="space-y-1.5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" /> Yêu Cầu Báo Giá Nhanh
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Để lại thông tin dưới đây, chúng tôi sẽ lập tức liên hệ gửi báo giá chi tiết sản phẩm này.
                </p>
              </div>

              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <label htmlFor="quote-name" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="quote-name"
                    autoComplete="name"
                    value={quoteForm.name}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, name: e.target.value });
                      if (quoteErrors.name) setQuoteErrors({ ...quoteErrors, name: undefined });
                    }}
                    placeholder="Nhập họ và tên của bạn"
                    aria-invalid={quoteErrors.name ? true : undefined}
                    aria-describedby={quoteErrors.name ? 'quote-name-error' : undefined}
                    className={`w-full px-4 py-2.5 min-h-touch bg-slate-50 rounded-xl focus:bg-white focus:border-blue-600 text-sm font-semibold transition-all border ${
                      quoteErrors.name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {quoteErrors.name && (
                    <p id="quote-name-error" role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {quoteErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quote-phone" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    id="quote-phone"
                    inputMode="tel"
                    autoComplete="tel"
                    value={quoteForm.phone}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, phone: e.target.value });
                      if (quoteErrors.phone) setQuoteErrors({ ...quoteErrors, phone: undefined });
                    }}
                    placeholder="Ví dụ: 0326711476"
                    aria-invalid={quoteErrors.phone ? true : undefined}
                    aria-describedby={quoteErrors.phone ? 'quote-phone-error' : undefined}
                    className={`w-full px-4 py-2.5 min-h-touch bg-slate-50 rounded-xl focus:bg-white focus:border-blue-600 text-sm font-semibold transition-all border ${
                      quoteErrors.phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {quoteErrors.phone && (
                    <p id="quote-phone-error" role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {quoteErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quote-email" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Địa chỉ Email (Nếu có)
                  </label>
                  <input
                    type="email"
                    id="quote-email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    placeholder="Nhập địa chỉ email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="quote-product" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Sản phẩm quan tâm
                  </label>
                  <input
                    type="text"
                    id="quote-product"
                    disabled
                    value={product.name}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="quote-note" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Ghi chú / Yêu cầu riêng
                  </label>
                  <textarea
                    id="quote-note"
                    rows={3}
                    value={quoteForm.note}
                    onChange={(e) => setQuoteForm({ ...quoteForm, note: e.target.value })}
                    placeholder="Cần tư vấn mức cân bao nhiêu, địa điểm giao hàng..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingQuote ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi yêu cầu ngay
                    </>
                  )}
                </button>
              </form>

              {quoteStatus === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start animate-scale-in">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 bg-emerald-100 rounded-full p-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-800 text-xs">Gửi yêu cầu thành công!</h5>
                    <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">
                      Cảm ơn quý khách. Đội ngũ tư vấn sẽ gọi lại hỗ trợ lập tức trong vài phút.
                    </p>
                  </div>
                </div>
              )}

              {quoteStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start animate-scale-in">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-800 text-xs">Không thể gửi yêu cầu!</h5>
                    <p className="text-[10px] text-red-700 leading-tight mt-0.5">
                      Đã có lỗi xảy ra. Quý khách vui lòng thử lại hoặc bấm gọi hotline để được hỗ trợ trực tiếp.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[45] bg-white border-t border-slate-200 p-2.5 flex gap-2.5 shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
        <a
          href={telHref(BUSINESS.phones[0])}
          className="flex-1 inline-flex items-center justify-center py-2.5 px-3 bg-red-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all gap-1.5 shadow-md shadow-red-500/10"
        >
          <Phone className="w-4 h-4" />
          Gọi kỹ thuật
        </a>
        
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center py-2.5 px-3 bg-sky-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all gap-1.5 shadow-md shadow-sky-500/10"
        >
          <MessageSquare className="w-4 h-4" />
          Nhắn Zalo
        </a>

        <button
          onClick={scrollToQuoteForm}
          className="flex-1 inline-flex items-center justify-center py-2.5 px-3 bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all gap-1.5 shadow-md shadow-blue-500/10"
        >
          <Mail className="w-4 h-4" />
          Báo giá SP
        </button>
      </div>

      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col justify-between p-4 animate-scale-in cursor-zoom-out"
          onClick={() => setShowImageModal(false)}
        >
          <div className="flex items-center justify-between w-full p-2">
            <span 
              className="text-white font-bold text-xs md:text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm cursor-default"
              onClick={e => e.stopPropagation()}
            >
              Hình ảnh {activeImageIndex + 1} / {allImages.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(false);
              }}
              className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-90 text-white rounded-full transition-all cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative max-h-[80vh]">
            <button
              onClick={handlePrevImage}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm active:scale-90 transition-all z-10 cursor-pointer"
              aria-label="Ảnh trước"
              onClickCapture={e => e.stopPropagation()}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <div className="max-w-7xl max-h-full flex items-center justify-center p-2">
              <Image
                src={allImages[activeImageIndex]}
                alt={product.name}
                width={1920}
                height={1080}
                unoptimized={!isOptimizableImage(allImages[activeImageIndex])}
                className="max-w-full max-h-[75vh] object-contain rounded-lg cursor-default"
                onClick={e => e.stopPropagation()}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultImage();
                }}
              />
            </div>

            <button
              onClick={handleNextImage}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm active:scale-90 transition-all z-10 cursor-pointer"
              aria-label="Ảnh tiếp theo"
              onClickCapture={e => e.stopPropagation()}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          <div className="w-full flex flex-col items-center gap-3 py-2">
            {allImages.length > 1 && (
              <div 
                className="flex gap-2 max-w-full overflow-x-auto px-4 py-1 scrollable-content"
                onClick={e => e.stopPropagation()}
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`relative flex-shrink-0 w-16 h-12 bg-white/10 border rounded-lg overflow-hidden transition-all cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-500 scale-105'
                        : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Lightbox thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      unoptimized={!isOptimizableImage(img)}
                      className="object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultImage();
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            <p 
              className="text-white/40 text-[11px] font-semibold cursor-default"
              onClick={e => e.stopPropagation()}
            >
              Click ngoài vùng ảnh hoặc bấm nút X để đóng chế độ phóng to
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
