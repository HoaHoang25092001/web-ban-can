'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

/**
 * Nhận biết người dùng gõ email hay tên đăng nhập.
 *
 * Quản trị viên đăng nhập bằng EMAIL, khách hàng dùng phần cân đăng nhập bằng
 * TÊN ĐĂNG NHẬP (chữ thường, số, _ hoặc -, không có @). Dấu @ là chỗ khác
 * nhau rõ ràng nhất, và tên đăng nhập không cho phép ký tự này.
 */
const looksLikeEmail = (s: string) => s.includes('@');

/**
 * Trang đăng nhập chung cho cả hai loại tài khoản.
 *
 * Trước đây có hai trang riêng (/admin/login và /can-dien-tu/dang-nhap): khách
 * hàng dễ vào nhầm trang rồi gõ đúng mật khẩu mà vẫn báo sai, vì mỗi trang chỉ
 * hỏi đúng một bảng tài khoản.
 *
 * Nay một trang duy nhất tự nhận biết loại tài khoản và chuyển tới đúng nơi —
 * người dùng không phải biết mình thuộc "loại" nào (tiêu chí 1 & 8).
 */
export default function UnifiedLoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const fail = (msg: string) => {
    setError(msg);
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = account.trim();

    if (!value) {
      fail('Vui lòng nhập email hoặc tên đăng nhập.');
      document.getElementById('account')?.focus();
      return;
    }
    if (!password) {
      fail('Vui lòng nhập mật khẩu.');
      document.getElementById('password')?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      /*
       * Thử provider khớp với dạng đã gõ TRƯỚC, rồi mới thử provider kia.
       *
       * Đoán theo dấu @ đúng trong hầu hết trường hợp, nhưng không tuyệt đối:
       * quản trị viên có thể gõ thiếu phần sau @. Thử nốt cách còn lại để họ
       * vẫn vào được, thay vì báo sai mật khẩu một cách khó hiểu.
       */
      const order = looksLikeEmail(value)
        ? (['credentials', 'scale'] as const)
        : (['scale', 'credentials'] as const);

      let ok = false;
      for (const provider of order) {
        const res = await signIn(provider, {
          // Provider quản trị nhận trường `email`, provider cân nhận `username`.
          ...(provider === 'credentials' ? { email: value } : { username: value }),
          password,
          redirect: false,
        });
        if (res?.ok && !res.error) {
          ok = true;
          break;
        }
      }

      if (!ok) {
        // Không nói rõ sai tên hay sai mật khẩu, để người lạ không dò được
        // tài khoản nào có thật.
        fail('Thông tin đăng nhập không đúng, hoặc tài khoản đã bị khoá.');
        return;
      }

      /*
       * Đọc phiên vừa tạo để biết đăng nhập bằng loại tài khoản nào, rồi
       * chuyển đúng nơi. Không đoán theo dạng đã gõ: nếu đoán sai thì quản
       * trị viên bị đẩy sang khu cân và ngược lại.
       */
      const session = await getSession();
      router.push(session?.user?.kind === 'scale' ? '/can-dien-tu' : '/admin');
      router.refresh();
    } catch {
      fail('Không kết nối được máy chủ. Vui lòng thử lại sau.');
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
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Dành cho quản trị website và khách hàng dùng cân điện tử
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div ref={errorRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
              {error && (
                <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email hoặc tên đăng nhập
              </label>
              <input
                id="account"
                name="account"
                type="text"
                autoComplete="username"
                autoFocus
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="admin@congty.com hoặc xuong-abc"
                aria-invalid={error ? true : undefined}
                aria-describedby="account-hint"
                className="w-full min-h-touch px-3 py-2 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
              {/* Nói trước hệ thống tự phân biệt, để người dùng không băn khoăn
                  mình có đang gõ nhầm ô hay không (tiêu chí 8). */}
              <p id="account-hint" className="mt-1.5 text-xs text-gray-500">
                Hệ thống tự nhận biết loại tài khoản và chuyển bạn tới đúng nơi.
              </p>
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
                  className="w-full min-h-touch pl-3 pr-12 py-2 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Khách hàng chưa có tài khoản cân điện tử? Liên hệ Cân Vạn Thịnh Phát để được cấp.
        </p>
      </div>
    </div>
  );
}
