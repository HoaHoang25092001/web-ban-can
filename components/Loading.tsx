import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'detail' | 'news';
  text?: string;
  className?: string;
}

export function Spinner({ text = 'Đang tải dữ liệu...', className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 ${className}`}>
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      {text && <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
}

export function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm p-3 space-y-3 animate-pulse">
          <div className="aspect-[4/3] bg-slate-200 rounded-xl w-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse space-y-8">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl w-full"></div>
          <div className="flex gap-3 justify-center">
            <div className="w-20 h-16 bg-slate-200 rounded-xl"></div>
            <div className="w-20 h-16 bg-slate-200 rounded-xl"></div>
            <div className="w-20 h-16 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-10 bg-slate-200 rounded w-3/4"></div>
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-slate-200 rounded-xl"></div>
            <div className="h-12 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm animate-pulse flex flex-col h-full">
          <div className="h-52 bg-slate-200" />
          <div className="p-5 space-y-3 flex-1 flex flex-col">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-5 bg-slate-200 rounded w-full" />
            <div className="h-5 bg-slate-200 rounded w-4/5" />
            <div className="h-3 bg-slate-200 rounded w-full flex-1" />
            <div className="h-8 bg-slate-200 rounded-xl w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Loading({ type = 'spinner', text, className }: LoadingProps) {
  if (type === 'skeleton') {
    return <SkeletonCard count={4} />;
  }
  if (type === 'detail') {
    return <SkeletonDetail />;
  }
  if (type === 'news') {
    return <NewsCardSkeleton count={3} />;
  }
  return <Spinner text={text} className={className} />;
}
