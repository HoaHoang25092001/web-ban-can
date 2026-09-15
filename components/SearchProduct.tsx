'use client';

import { useState, FormEvent, useId } from 'react';
import { useRouter } from 'next/navigation';

interface SearchProductProps {
  /** Compact mode: gọn hơn, không có gợi ý – dùng trong Header */
  compact?: boolean;
}

const SUGGESTIONS = ['Cân bàn', 'Cân sàn', 'Cân treo', 'Cân phân tích'];

export default function SearchProduct({ compact = false }: SearchProductProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  // useId đảm bảo label/input ghép đúng cặp khi component xuất hiện nhiều lần
  const inputId = useId();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSearch} role="search" className="w-full">
        {/* Label ẩn về mặt thị giác nhưng vẫn tồn tại cho screen reader:
            placeholder không thay thế được label (tiêu chí 8). */}
        <label htmlFor={inputId} className="sr-only-text">
          Tìm kiếm sản phẩm
        </label>
        <div className="flex w-full border-2 border-surface-border rounded-control overflow-hidden bg-white focus-within:border-brand-600 transition-colors">
          <input
            id={inputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm cân bàn, cân sàn, cân treo…"
            className="flex-1 min-w-0 min-h-touch px-3 text-base md:text-sm text-slate-900 outline-none bg-transparent"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="min-w-touch min-h-touch px-3 bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center flex-shrink-0"
          >
            <i className="ri-search-line text-lg" aria-hidden="true"></i>
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSearch} role="search">
        <label htmlFor={inputId} className="field-label">
          Tìm sản phẩm
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên cân, ví dụ: cân bàn 100kg"
            className="field-input flex-1"
          />
          <button type="submit" className="btn-primary flex-shrink-0">
            <i className="ri-search-line text-lg" aria-hidden="true"></i>
            <span className="hidden sm:inline">Tìm kiếm</span>
            <span className="sm:hidden sr-only-text">Tìm kiếm</span>
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Tìm nhiều:</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => router.push(`/search?q=${encodeURIComponent(suggestion)}`)}
            className="inline-flex items-center min-h-[36px] px-3 text-sm font-medium bg-surface-sunken text-slate-700 rounded-full hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
