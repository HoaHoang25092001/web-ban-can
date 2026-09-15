'use client';

import { useState, useRef, useId } from 'react';
import { PRIMARY_PHONE, telHref } from '@/lib/site';

type FieldName = 'name' | 'phone' | 'email' | 'subject' | 'message';

const SUBJECTS = [
  { value: 'price-quote', label: 'Xin báo giá' },
  { value: 'product-inquiry', label: 'Tư vấn chọn sản phẩm' },
  { value: 'technical-support', label: 'Hỗ trợ kỹ thuật' },
  { value: 'warranty', label: 'Bảo hành, sửa chữa' },
  { value: 'collaboration', label: 'Hợp tác kinh doanh' },
  { value: 'other', label: 'Nội dung khác' },
];

const MAX_MESSAGE = 1000;

const EMPTY = { name: '', phone: '', email: '', subject: '', message: '' };

/**
 * Thông báo lỗi cụ thể theo từng trường, nói rõ sai ở đâu và cần sửa thế nào
 * (tiêu chí 8) thay vì một câu chung chung "có lỗi xảy ra".
 */
function validateField(name: FieldName, value: string): string {
  const v = value.trim();
  switch (name) {
    case 'name':
      if (!v) return 'Vui lòng nhập họ và tên để chúng tôi biết cách xưng hô.';
      if (v.length < 2) return 'Họ và tên cần ít nhất 2 ký tự.';
      return '';
    case 'phone': {
      if (!v) return 'Vui lòng nhập số điện thoại để chúng tôi gọi lại.';
      const digits = v.replace(/[\s.\-()]/g, '');
      if (!/^(\+?84|0)\d{9,10}$/.test(digits)) {
        return 'Số điện thoại chưa đúng. Ví dụ hợp lệ: 0326711476.';
      }
      return '';
    }
    case 'email':
      // Email không bắt buộc – chỉ kiểm tra khi người dùng có nhập
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return 'Email chưa đúng định dạng. Ví dụ: ten@congty.com.';
      }
      return '';
    case 'subject':
      if (!v) return 'Vui lòng chọn nội dung bạn cần hỗ trợ.';
      return '';
    case 'message':
      if (!v) return 'Vui lòng mô tả nhu cầu để chúng tôi tư vấn đúng loại cân.';
      if (v.length < 10) return 'Nội dung quá ngắn, vui lòng mô tả thêm (tối thiểu 10 ký tự).';
      return '';
    default:
      return '';
  }
}

export default function ContactForm() {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'' | 'success' | 'error'>('');
  const statusRef = useRef<HTMLDivElement>(null);
  // Form này xuất hiện ở cả trang chủ lẫn trang liên hệ; useId đảm bảo id của
  // input là duy nhất để label/aria-describedby không trỏ nhầm sang form kia.
  const uid = useId();
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as { name: FieldName; value: string };
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Chỉ xác thực lại khi trường đã từng được chạm vào: tránh báo đỏ ngay
    // lúc người dùng mới gõ ký tự đầu tiên.
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as { name: FieldName; value: string };
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Xác thực toàn bộ trước khi gửi
    const nextErrors: Partial<Record<FieldName, string>> = {};
    (Object.keys(EMPTY) as FieldName[]).forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) nextErrors[field] = message;
    });

    setErrors(nextErrors);
    setTouched({ name: true, phone: true, email: true, subject: true, message: true });

    if (Object.keys(nextErrors).length > 0) {
      // Đưa con trỏ tới trường lỗi đầu tiên để người dùng sửa ngay
      const firstError = (Object.keys(EMPTY) as FieldName[]).find((f) => nextErrors[f]);
      if (firstError) document.getElementById(fieldId(firstError))?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData(EMPTY);
        setTouched({});
        setErrors({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // Đưa thông báo kết quả vào tầm nhìn và tầm đọc của screen reader
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  };

  /** Thuộc tính chung cho mọi input: nối label, lỗi và trạng thái invalid. */
  const fieldProps = (name: FieldName) => ({
    id: fieldId(name),
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${fieldId(name)}-error` : undefined,
    className: `field-input ${errors[name] ? 'field-input-error' : ''}`,
  });

  const FieldError = ({ name }: { name: FieldName }) =>
    errors[name] ? (
      <p id={`${fieldId(name)}-error`} className="field-error" role="alert">
        <i className="ri-error-warning-line flex-shrink-0 mt-0.5" aria-hidden="true"></i>
        <span>{errors[name]}</span>
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Thông báo kết quả – đặt trên đầu form để không bị bỏ sót */}
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
        {submitStatus === 'success' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-control flex items-start gap-2">
            <i className="ri-checkbox-circle-fill text-emerald-600 text-lg flex-shrink-0" aria-hidden="true"></i>
            <p className="text-emerald-800 text-sm leading-relaxed">
              <strong className="font-semibold">Đã gửi thành công.</strong> Chúng tôi sẽ gọi lại
              trong giờ làm việc (T2–T6: 8:00–17:30, T7: 8:00–12:00). Cần gấp, vui lòng gọi{' '}
              <a href={telHref(PRIMARY_PHONE)} className="underline font-semibold">{PRIMARY_PHONE}</a>.
            </p>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-control flex items-start gap-2">
            <i className="ri-error-warning-fill text-red-600 text-lg flex-shrink-0" aria-hidden="true"></i>
            <p className="text-red-800 text-sm leading-relaxed">
              Không gửi được thông tin. Vui lòng thử lại, hoặc gọi trực tiếp{' '}
              <a href={telHref(PRIMARY_PHONE)} className="underline font-semibold">{PRIMARY_PHONE}</a>.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          {/* Label gắn với input qua htmlFor, không dùng placeholder làm nhãn */}
          <label htmlFor={fieldId('name')} className="field-label">
            Họ và tên <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only-text">(bắt buộc)</span>
          </label>
          <input type="text" autoComplete="name" placeholder="Nguyễn Văn A" {...fieldProps('name')} />
          <FieldError name="name" />
        </div>

        <div>
          <label htmlFor={fieldId('phone')} className="field-label">
            Số điện thoại <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only-text">(bắt buộc)</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0326711476"
            {...fieldProps('phone')}
          />
          <FieldError name="phone" />
        </div>
      </div>

      <div>
        <label htmlFor={fieldId('email')} className="field-label">
          Email <span className="font-normal text-slate-500">(không bắt buộc)</span>
        </label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="ten@congty.com"
          {...fieldProps('email')}
        />
        {errors.email ? <FieldError name="email" /> : (
          <p className="field-hint">Để lại email nếu bạn muốn nhận báo giá bằng văn bản.</p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('subject')} className="field-label">
          Bạn cần hỗ trợ gì? <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only-text">(bắt buộc)</span>
        </label>
        <select {...fieldProps('subject')}>
          <option value="">— Chọn nội dung —</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <FieldError name="subject" />
      </div>

      <div>
        <label htmlFor={fieldId('message')} className="field-label">
          Nội dung chi tiết <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only-text">(bắt buộc)</span>
        </label>
        <textarea
          rows={5}
          maxLength={MAX_MESSAGE}
          placeholder="Ví dụ: Cần cân bàn 100kg cho kho hàng, đặt tại Thủ Đức."
          {...fieldProps('message')}
          className={`${fieldProps('message').className} resize-y`}
        />
        <div className="flex justify-between items-start gap-3 mt-1.5">
          <div className="flex-1">
            {errors.message ? (
              <FieldError name="message" />
            ) : (
              <p className="text-sm text-slate-500">
                Mô tả nhu cầu càng rõ, chúng tôi báo giá càng chính xác.
              </p>
            )}
          </div>
          <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums" aria-hidden="true">
            {formData.message.length}/{MAX_MESSAGE}
          </span>
        </div>
      </div>

      {/* CTA chính duy nhất của form (tiêu chí 8) */}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? (
          <>
            <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
            Đang gửi…
          </>
        ) : (
          <>
            <i className="ri-send-plane-fill" aria-hidden="true"></i>
            Gửi yêu cầu tư vấn
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        Thông tin của bạn chỉ dùng để liên hệ tư vấn và báo giá, không chia sẻ cho bên thứ ba.
      </p>
    </form>
  );
}
