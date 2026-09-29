'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Scale, Loader2, AlertCircle } from 'lucide-react';

/**
 * Đăng nhập cho khách hàng dùng phần cân điện tử.
 *
 * Tài khoản do chủ shop cấp — không có chỗ tự đăng ký, cũng không có "quên
 * mật khẩu" tự động: khách gọi cho shop để được đặt lại.
 */
export default function ScaleLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      /* provider 'scale' — không dùng provider mặc định của khu quản trị,
       * nếu không khách sẽ bị kiểm tra ở bảng admin và luôn báo sai mật khẩu. */
      const res = await signIn('scale', { username, password, redirect: false });
      if (res?.ok) {
        router.push('/can-dien-tu');
        router.refresh();
      } else {
        // Không nói rõ sai tên hay sai mật khẩu, để người lạ không dò được
        // tài khoản nào có thật.
        setError('Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản đã bị khoá.');
      }
    } catch {
      setError('Không kết nối được tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 text-white items-center justify-center mb-3">
            <Scale className="w-7 h-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Cân điện tử</h1>
          <p className="text-sm text-slate-600 mt-1">Đăng nhập để ghi lại số liệu cân hàng</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          Chưa có tài khoản? Liên hệ Cân Vạn Thịnh Phát để được cấp.
        </p>
      </div>
    </div>
  );
}
