'use client';

import { useId } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  // Vùng chạm tối thiểu 44px cho md/lg, 36px cho nút phụ trong bảng (tiêu chí 5)
  const sizeClasses = {
    sm: 'min-h-[36px] px-3 text-sm',
    md: 'min-h-touch px-4 text-sm',
    lg: 'min-h-touch px-6 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Nhãn + dấu bắt buộc, dùng chung cho mọi trường nhập. */
function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
      {required && (
        <>
          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          <span className="sr-only-text">(bắt buộc)</span>
        </>
      )}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

/** Lớp dùng chung để input, textarea và select trông giống hệt nhau (tiêu chí 2). */
const controlClasses = (hasError?: boolean) =>
  `w-full min-h-touch px-3 py-2 text-base text-gray-900 bg-white border-2 rounded-lg
   placeholder:text-gray-500 focus:outline-none transition-colors ${
     hasError ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-600'
   }`;

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  autoComplete,
}: InputProps) {
  // useId: bản trước <label> không có htmlFor và <input> không có id, nên bấm
  // vào nhãn không focus được ô nhập và screen reader đọc ô nhập là "không tên".
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={controlClasses(!!error)}
      />
      {!error && hint && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  error,
  hint,
}: TextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${controlClasses(!!error)} resize-y`}
      />
      {!error && hint && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  hint,
  placeholder = '— Chọn —',
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={controlClasses(!!error)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!error && hint && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
