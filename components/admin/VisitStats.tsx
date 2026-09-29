'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Eye, MapPin, RefreshCw, Loader2 } from 'lucide-react';

interface RegionRow {
  name: string;
  views: number;
  visitors: number;
}

interface VisitData {
  online: number;
  total: number;
  today: number;
  todayVisitors: number;
  onlineWindowMinutes: number;
  byRegion: RegionRow[];
}

/** Dấu chấm phân cách nghìn theo kiểu Việt Nam: 9035574 → "9.035.574". */
const fmt = (n: number) => n.toLocaleString('vi-VN');

/** Làm mới số "đang online" mỗi 30 giây — đủ nhanh để thấy biến động, mà
 *  không dội truy vấn liên tục vào database (tiêu chí 7). */
const REFRESH_MS = 30_000;

/**
 * Thống kê truy cập trên trang Tổng quan.
 *
 * Trước đây trang quản trị chỉ đếm được số sản phẩm, bài viết — không biết có
 * bao nhiêu khách đang xem hàng, cũng không biết khách đến từ đâu để còn
 * quyết định nhập hàng hay chạy quảng cáo ở tỉnh nào (tiêu chí 1 & 10).
 */
export default function VisitStats() {
  const [data, setData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/stats/visits');
      if (!res.ok) {
        setError(true);
        return;
      }
      setData(await res.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Đang tải số liệu truy cập…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="bg-white rounded-2xl border border-amber-200 p-6">
        <p className="text-sm text-gray-700">
          Không tải được số liệu truy cập.{' '}
          <button
            type="button"
            onClick={() => load()}
            className="font-semibold text-blue-700 hover:underline"
          >
            Thử lại
          </button>
        </p>
      </div>
    );
  }

  const maxViews = Math.max(1, ...data.byRegion.map((r) => r.views));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Lượt truy cập website</h2>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Làm mới
        </button>
      </div>

      {/* Ba con số chính */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            {/* Chấm xanh nhấp nháy: dấu hiệu quen thuộc cho "đang trực tuyến" */}
            <span className="relative flex h-3 w-3 flex-shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div className="text-3xl font-bold text-gray-900">{fmt(data.online)}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">Đang online</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Khách có hoạt động trong {data.onlineWindowMinutes} phút qua
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
            <div className="text-3xl font-bold text-gray-900">{fmt(data.total)}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">Tổng lượt truy cập</div>
          <div className="text-xs text-gray-500 mt-0.5">Tính từ khi bật thống kê</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
            <div className="text-3xl font-bold text-gray-900">{fmt(data.today)}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">Lượt xem hôm nay</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Từ {fmt(data.todayVisitors)} khách khác nhau
          </div>
        </div>
      </div>

      {/* Bảng theo tỉnh thành */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Khách đến từ đâu</h3>
            <p className="text-xs text-gray-500">20 tỉnh/thành có nhiều lượt xem nhất</p>
          </div>
        </div>

        {data.byRegion.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600">Chưa có lượt truy cập nào được ghi nhận.</p>
            <p className="text-xs text-gray-500 mt-1">
              Số liệu sẽ xuất hiện khi có khách truy cập website.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.byRegion.map((r) => (
              <li key={r.name} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-sm font-medium text-gray-900 truncate">{r.name}</span>
                  <span className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                    {fmt(r.views)} lượt
                    <span className="text-xs text-gray-500"> · {fmt(r.visitors)} khách</span>
                  </span>
                </div>
                {/* Thanh ngang giúp so sánh nhanh giữa các tỉnh mà không phải
                    đọc và nhẩm từng con số (tiêu chí 3). */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.max(2, (r.views / maxViews) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
