'use client';

import { signIn } from 'next-auth/react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Xác thực tại chỗ trước khi gọi server (tiêu chí 8)
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      document.getElementById('email')?.focus();
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      document.getElementById('password')?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
        requestAnimationFrame(() => errorRef.current?.focus());
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại sau.');
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="inline-flex w-12 h-12 rounded-full bg-blue-50 text-blue-600 items-center justify-center mb-4">
              <LogIn className="w-6 h-6" aria-hidden="true" />
            </span>
            {/* Tiêu chí 1: nói rõ trang này dành cho ai */}
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập quản trị</h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Dành cho nhân viên quản lý nội dung website
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Thông báo lỗi được screen reader đọc lên và nhận focus */}
            <div ref={errorRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            <div>
              {/* Nhãn hiện rõ, không dùng placeholder thay nhãn (tiêu chí 8) */}
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@congty.com"
                aria-invalid={error ? true : undefined}
                className="w-full min-h-touch px-3 py-2 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  aria-invalid={error ? true : undefined}
                  className="w-full min-h-touch pl-3 pr-12 py-2 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
                {/* Cho phép xem lại mật khẩu vừa gõ – giảm lỗi nhập sai */}
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập…
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/*
          Khối "Tài khoản demo" ở bản trước in thẳng email và mật khẩu quản trị
          ra màn hình đăng nhập công khai — bất kỳ ai mở /admin/login đều đọc
          được và đăng nhập vào trang quản trị. Đã gỡ bỏ.
        */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Quên mật khẩu? Liên hệ người quản trị hệ thống để được cấp lại.
        </p>
      </div>
    </div>
  );
}
