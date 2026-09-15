'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface FilterState {
  search: string;
  categoryId: string;
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export default function ProductFilter({ onFilterChange, initialFilters }: ProductFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters?.search || '',
    categoryId: initialFilters?.categoryId || 'all',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFilterChange({ search: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    handleFilterChange({ categoryId: value });
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', categoryId: 'all' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.search.trim() !== '' || filters.categoryId !== 'all';

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse bg-gray-200 h-10 w-80 rounded-md"></div>
          <div className="animate-pulse bg-gray-200 h-10 w-48 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <label htmlFor="product-search" className="sr-only">
            Tìm kiếm sản phẩm theo tên
          </label>
          <input
            id="product-search"
            type="search"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={filters.search}
            onChange={handleSearchChange}
            className="block w-full min-h-touch pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-base sm:text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <label htmlFor="product-category-filter" className="sr-only">
              Lọc theo danh mục
            </label>
            <select
              id="product-category-filter"
              value={filters.categoryId}
              onChange={handleCategoryChange}
              className="block min-h-touch py-2 px-3 border-2 border-gray-300 bg-white rounded-lg text-base sm:text-sm focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Xóa bộ lọc"
            >
              <X className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
          {filters.search.trim() !== '' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tìm kiếm: &quot;{filters.search}&quot;
            </span>
          )}
          {filters.categoryId !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Danh mục: {categories.find(c => c.id.toString() === filters.categoryId)?.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}