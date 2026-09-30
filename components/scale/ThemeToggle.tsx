'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { THEME_STORAGE_KEY } from '@/lib/scale-theme';

/**
 * Theo dõi class `dark` trên <html>.
 *
 * Dùng MutationObserver thay vì một biến trạng thái riêng: class do đoạn mã
 * chạy sớm trong <head> đặt, nên React không biết giá trị ban đầu. Quan sát
 * trực tiếp thì nút luôn khớp với giao diện thật.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    // Giá trị lúc dựng trên máy chủ: luôn là sáng, tránh lệch giữa hai bên.
    () => false
  );
}

export function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // Chế độ riêng tư chặn localStorage — nút vẫn đổi được cho phiên hiện tại.
  }
}

/**
 * Nút bật/tắt chế độ tối.
 *
 * Nhãn nói HÀNH ĐỘNG sắp làm ("Bật chế độ tối"), nên không dùng aria-pressed:
 * theo hướng dẫn WAI-ARIA, không kết hợp nhãn thay đổi với trạng thái nhấn —
 * người dùng trình đọc màn hình sẽ nghe hai thông tin mâu thuẫn.
 */
export default function ThemeToggle() {
  const isDark = useIsDark();
  const label = isDark ? 'Tắt chế độ tối' : 'Bật chế độ tối';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setDarkMode(!isDark)}
      className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-scale-fg hover:bg-scale-muted transition-colors"
    >
      {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}
