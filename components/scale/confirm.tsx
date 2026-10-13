'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { TriangleAlert, HelpCircle } from 'lucide-react';
import { buttonClass } from '@/components/scale/ui';

interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  /** Chữ trên nút đồng ý — nói rõ việc sẽ làm ("Xoá phiếu"), không dùng "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" cho việc không hoàn tác được: nút đỏ, biểu tượng cảnh báo. */
  tone?: 'default' | 'danger';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Hộp xác nhận dùng chung, thay cho confirm() của trình duyệt.
 *
 * confirm() của trình duyệt chỉ có hai nút "OK / Huỷ" — người dùng phải đọc
 * kỹ câu hỏi mới biết "OK" là xoá hay giữ. Ở đây nút ghi đúng việc sẽ làm
 * ("Xoá phiếu", "Vẫn lưu"), việc nguy hiểm có màu đỏ, và nút được chọn sẵn
 * là nút AN TOÀN (Huỷ) — lỡ tay bấm Enter cũng không mất dữ liệu.
 *
 * Dùng thẻ <dialog> gốc: tự giữ con trỏ bàn phím bên trong, Esc để đóng, trình
 * đọc màn hình đọc đúng là hộp thoại — không phải tự viết lại những thứ đó.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (options && dialog && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
  }, [options]);

  const close = (ok: boolean) => {
    dialogRef.current?.close();
    resolveRef.current?.(ok);
    resolveRef.current = null;
    setOptions(null);
  };

  const danger = options?.tone === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        aria-describedby={options?.message ? 'confirm-message' : undefined}
        // Esc của trình duyệt: coi như Huỷ.
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        // Bấm ra vùng tối bên ngoài: cũng là Huỷ.
        onClick={(e) => {
          if (e.target === dialogRef.current) close(false);
        }}
        className="w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-scale-border bg-scale-card text-scale-fg p-0 shadow-2xl backdrop:bg-slate-950/60"
      >
        {options && (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <span
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  danger ? 'bg-scale-danger-soft text-scale-danger' : 'bg-scale-accent text-scale-primary'
                }`}
              >
                {danger ? (
                  <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <HelpCircle className="w-5 h-5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-lg font-bold leading-snug">
                  {options.title}
                </h2>
                {options.message && (
                  <div id="confirm-message" className="text-sm text-scale-muted-fg mt-1.5 leading-relaxed">
                    {options.message}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button ref={cancelRef} type="button" onClick={() => close(false)} className={buttonClass({ variant: 'secondary' })}>
                {options.cancelLabel ?? 'Huỷ'}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={buttonClass({ variant: danger ? 'danger' : 'primary' })}
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  // Ngoài ConfirmProvider (không nên xảy ra): quay về confirm() của trình duyệt để không mất bước xác nhận.
  return ctx ?? (async (o) => window.confirm(o.title));
}
