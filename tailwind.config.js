/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    // ── Tiêu chí 2: Typography có thang đo (ratio ~1.25) ────────────────────
    // body >= 16px, nội dung dài 18px, line-height đi kèm để nhịp dọc ổn định.
    fontSize: {
      xs:   ['clamp(0.8125rem, 0.78rem + 0.15vw, 0.875rem)', { lineHeight: '1.15rem' }], // 13→14 – chú thích
      sm:   ['clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem)', { lineHeight: '1.35rem' }], // 14→15 – meta, label phụ
      base: ['1rem',     { lineHeight: '1.5rem' }],    // 16 – body tối thiểu
      lg:   ['1.125rem', { lineHeight: '1.75rem' }],   // 18 – nội dung dài
      xl:   ['1.25rem',  { lineHeight: '1.75rem' }],   // 20
      '2xl':['1.5rem',   { lineHeight: '2rem' }],      // 24
      '3xl':['1.875rem', { lineHeight: '2.25rem' }],   // 30
      '4xl':['2.25rem',  { lineHeight: '2.5rem' }],    // 36
      '5xl':['3rem',     { lineHeight: '1.15' }],      // 48
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        /*
         * Logo dùng chính font thân trang, chỉ khác ở độ đậm và giãn chữ.
         * Bản trước dùng Pacifico (chữ viết tay) — kiểu chữ này hợp tiệm bánh
         * hay quán cà phê, còn với thiết bị đo lường công nghiệp thì truyền tải
         * sai thông điệp: khách cần cảm giác chính xác và đáng tin, không phải
         * mềm mại thủ công. Dùng chung font cũng bớt một lượt tải (tiêu chí 7).
         */
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // ── Tiêu chí 2: Màu theo tỷ lệ 60/30/10 ──────────────────────────────
      // surface/neutral = 60%, brand (cấu trúc: nav, footer, header) = 30%,
      // accent = 10% dành riêng cho hành động chính (CTA, giá, badge).
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2C7BE5',
          600: '#1565C0', // nav bar chính
          700: '#0D47A1', // header danh mục / hover đậm
          800: '#0D3B6E',
          900: '#0A2E56',
        },
        accent: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          500: '#EA580C',
          // accent-600 dùng cho nút CTA và giá. Chọn #C2410C vì đạt tương phản
          // 5.18:1 — vượt ngưỡng AA 4.5:1 cả khi làm nền (chữ trắng) lẫn khi làm
          // màu chữ trên nền trắng. Sắc #EA580C trước đó chỉ đạt 3.56:1.
          600: '#C2410C',
          700: '#9A3412',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F8FAFC', // nền trung tính 60%
          sunken:  '#F1F5F9',
          border:  '#E2E8F0',
        },
      },
      // ── Tiêu chí 2: Spacing lưới 8px (bội số 4/8) ────────────────────────
      spacing: {
        '4.5': '1.125rem', // 18
        '18':  '4.5rem',   // 72
        '22':  '5.5rem',   // 88
      },
      // Vùng chạm tối thiểu 44×44px (tiêu chí 5)
      minWidth:  { touch: '44px' },
      minHeight: { touch: '44px' },
      maxWidth: {
        prose: '68ch', // độ dài dòng 50–75 ký tự
        shell: '1280px',
      },
      borderRadius: {
        card: '0.75rem',
        control: '0.5rem',
      },
      boxShadow: {
        card:      '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.05)',
        control:   '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      },
      transitionDuration: { DEFAULT: '200ms' },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        'fade-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'fade-up': 'fade-up 300ms ease-out',
        marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
      },
    },
  },
  plugins: [],
}
