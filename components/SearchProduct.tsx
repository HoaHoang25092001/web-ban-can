'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchProduct() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên..."
              className="w-full px-6 py-2 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            <i className="ri-search-line absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400"></i>
          </div>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-search-line text-xl"></i>
            Tìm kiếm
          </button>
        </div>
      </form>
      
      {/* Quick search suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Gợi ý:</span>
        {['Cân điện tử', 'Cân kỹ thuật', 'Cân bàn', 'Cân sàn'].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setSearchQuery(suggestion);
              router.push(`/search?q=${encodeURIComponent(suggestion)}`);
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
