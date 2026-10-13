import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

/**
 * Bộ thành phần giao diện dùng chung cho toàn khu cân điện tử.
 *
 * Mọi nút, ô nhập, thẻ, nhãn trạng thái của các màn hình đều lấy từ đây, để
 * cùng một việc luôn trông và hoạt động giống nhau ở mọi nơi. Sửa một chỗ là
 * cả ứng dụng đổi theo, không còn cảnh mỗi màn hình một kiểu nút.
 *
 * Màu đều là token `scale-*` (app/globals.css), đã đo tương phản WCAG 2.2 AA
 * cho cả chế độ sáng và tối.
 */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Nút                                                                 */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type ButtonSize = 'md' | 'lg';

/**
 * Vòng viền khi đi bằng phím Tab. Dùng chung cho mọi thứ bấm được, để người
 * không dùng chuột luôn biết mình đang ở đâu (WCAG 2.4.7, 2.4.11).
 */
export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scale-ring focus-visible:ring-offset-2 focus-visible:ring-offset-scale-card';

const VARIANT: Record<ButtonVariant, string> = {
  // Hành động chính của màn hình — mỗi khu vực chỉ nên có MỘT nút dạng này.
  primary: 'bg-scale-primary text-scale-primary-fg hover:bg-scale-primary-hover shadow-sm',
  secondary: 'bg-scale-card text-scale-fg border border-scale-input hover:bg-scale-muted',
  ghost: 'text-scale-fg hover:bg-scale-muted',
  danger: 'bg-scale-danger text-scale-danger-fg hover:bg-scale-danger-hover',
  'danger-ghost': 'text-scale-danger hover:bg-scale-danger-soft',
};

const SIZE: Record<ButtonSize, string> = {
  // 44px — vùng chạm tối thiểu cho ngón tay (WCAG 2.5.8 yêu cầu 24px, ta lấy rộng hơn).
  md: 'min-h-touch px-4 text-sm',
  lg: 'min-h-[3.25rem] px-6 text-base',
};

export function buttonClass({
  variant = 'secondary',
  size = 'md',
  block = false,
  iconOnly = false,
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; iconOnly?: boolean } = {}) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    FOCUS_RING,
    VARIANT[variant],
    iconOnly ? 'min-h-touch min-w-touch' : SIZE[size],
    block && 'w-full'
  );
}

/* ------------------------------------------------------------------ */
/* Ô nhập liệu                                                          */
/* ------------------------------------------------------------------ */

export function inputClass(invalid = false) {
  return cx(
    'w-full min-h-touch px-3 rounded-lg bg-scale-card text-scale-fg text-base sm:text-sm',
    'border placeholder:text-scale-muted-fg',
    'focus:outline-none focus:ring-2 focus:ring-scale-ring focus:border-scale-ring',
    'disabled:bg-scale-muted disabled:text-scale-muted-fg disabled:cursor-not-allowed',
    invalid ? 'border-scale-danger ring-1 ring-scale-danger' : 'border-scale-input'
  );
}

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

/**
 * Một ô nhập có nhãn, gợi ý và thông báo lỗi.
 *
 * Nhãn luôn hiện (không dùng chữ mờ trong ô thay nhãn — gõ vào là mất, người
 * dùng quên ô đó để làm gì). Lỗi hiện NGAY DƯỚI ô sai, có biểu tượng và chữ —
 * không chỉ tô đỏ, vì người mù màu không phân biệt được (WCAG 1.4.1, 3.3.1).
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-scale-fg mb-1.5">
        {label}
        {optional && <span className="font-normal text-scale-muted-fg"> (không bắt buộc)</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, ...(error ? { 'aria-invalid': true as const } : {}) })}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-scale-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-scale-muted-fg">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thẻ, tiêu đề trang                                                   */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  titleId,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  titleId?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cx('bg-scale-card text-scale-fg rounded-2xl border border-scale-border shadow-sm', className)}
    >
      {(title || actions) && (
        <div className={cx('flex flex-wrap items-start justify-between gap-3', padded ? 'px-5 pt-5' : 'px-5 pt-5 pb-3')}>
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-lg font-bold text-scale-fg leading-tight">
                {title}
              </h2>
            )}
            {description && <p className="text-sm text-scale-muted-fg mt-1">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? 'p-5' : undefined}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-scale-fg tracking-tight">{title}</h1>
        {description && <p className="text-sm sm:text-base text-scale-muted-fg mt-1.5 max-w-prose">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nhãn trạng thái, thông báo, trống                                    */
/* ------------------------------------------------------------------ */

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const BADGE_TONE: Record<Tone, string> = {
  neutral: 'bg-scale-muted text-scale-fg border-scale-border',
  info: 'bg-scale-accent text-scale-accent-fg border-scale-primary',
  success: 'bg-scale-success-soft text-scale-success border-scale-success',
  warning: 'bg-scale-warning-soft text-scale-warning border-scale-warning',
  danger: 'bg-scale-danger-soft text-scale-danger border-scale-danger',
};

/** Nhãn trạng thái — luôn có CHỮ, có thể kèm biểu tượng; không bao giờ chỉ là một chấm màu. */
export function Badge({ tone = 'neutral', icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap',
        BADGE_TONE[tone]
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const NOTICE_ICON: Record<Exclude<Tone, 'neutral'>, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

/**
 * Hộp thông báo kết quả thao tác.
 *
 * Lỗi dùng role="alert" để trình đọc màn hình đọc ngay; thành công dùng
 * role="status" — báo nhưng không cắt ngang việc đang làm (WCAG 4.1.3).
 */
export function Notice({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: Exclude<Tone, 'neutral'>;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = NOTICE_ICON[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-xl border p-3.5 text-sm', BADGE_TONE[tone], className)}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-px" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cx(Boolean(title) && 'mt-0.5', 'text-scale-fg')}>{children}</div>}
      </div>
      {action && <div className="flex-shrink-0 -my-1.5">{action}</div>}
    </div>
  );
}

/** Khi danh sách trống: nói rõ vì sao trống và bước tiếp theo, không để một vùng trắng trơn. */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="text-center px-6 py-12">
      {icon && <div className="mx-auto mb-3 flex justify-center text-scale-muted-fg">{icon}</div>}
      <p className="font-semibold text-scale-fg">{title}</p>
      {children && <div className="text-sm text-scale-muted-fg mt-1 max-w-md mx-auto">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Phím tắt hiển thị trên nút, ví dụ F2. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-current text-xs font-mono font-semibold">
      {children}
    </kbd>
  );
}
