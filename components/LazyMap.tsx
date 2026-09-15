'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/site';

interface LazyMapProps {
  /** Tỷ lệ khung hình, ví dụ "4/3" hoặc "16/9". */
  aspect?: string;
  className?: string;
}

/**
 * Bản đồ chỉ tải khi người dùng thực sự muốn xem.
 *
 * Google Maps nhúng kéo về ~929KB JavaScript — chiếm 69% dung lượng trang Liên
 * hệ. Bản đồ ở chân trang còn tải trên MỌI trang dù rất ít khách dùng tới.
 *
 * Thay bằng một ảnh giữ chỗ nhẹ; chỉ khi bấm mới nạp iframe thật. Khách cần chỉ
 * đường vẫn có link mở Google Maps ngay, không phải chờ (tiêu chí 7).
 */
export default function LazyMap({ aspect = '4/3', className = '' }: LazyMapProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative w-full rounded-card overflow-hidden bg-slate-800 ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {loaded ? (
        <iframe
          src={BUSINESS.maps.embed}
          title={`Bản đồ tới cửa hàng: ${BUSINESS.address.full}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 group"
        >
          <span className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center group-hover:bg-brand-500 transition-colors">
            <i className="ri-map-pin-2-line text-2xl" aria-hidden="true"></i>
          </span>
          <span className="text-sm font-semibold">Xem bản đồ đường đi</span>
          <span className="text-xs text-slate-400 px-4 text-center leading-relaxed">
            {BUSINESS.address.full}
          </span>
        </button>
      )}
    </div>
  );
}
