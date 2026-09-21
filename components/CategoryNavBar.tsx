'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

/*
 * `children` = menu con. "Trang thông tin" gom vào đây thay vì thành mục thứ
 * 6 riêng: thanh này giữ tối đa 5–7 mục để khách quét mắt được trong một nhịp
 * (tiêu chí 4). Trang nội dung chủ yếu để khách vào từ Google chứ không phải
 * lối đi chính, nên nằm ở cấp hai là hợp lý.
 */
/*
 * Kiểu của một mục trên thanh điều hướng.
 *
 * Mục ĐANG XEM phải khác được với mục chỉ đang rê chuột. Bản trước cả hai
 * cùng dùng nền brand-700 — mà brand-700 cũng chính là màu nút "Danh mục sản
 * phẩm" — nên khi đứng ở một trang con, mục cha và nút danh mục đậm y hệt
 * nhau, nhìn như cả hai cùng được chọn.
 *
 * Nay mục đang xem có thêm VẠCH DƯỚI CHÂN, thứ mà trạng thái rê chuột không
 * có. Dấu hiệu không chỉ dựa vào sắc độ nền nên phân biệt được cả khi màn
 * hình chỉnh màu lệch hoặc người dùng khó phân biệt màu (tiêu chí 3 & 5).
 */
const NAV_ITEM =
  'relative text-white text-sm font-semibold uppercase min-h-touch flex items-center whitespace-nowrap transition-colors';
const NAV_ACTIVE =
  'bg-brand-800 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-white';
const NAV_IDLE = 'hover:bg-brand-700';

const navLinks = [
  {
    label: 'Giới thiệu',
    href: '/introduce',
    children: [
      { label: 'Về công ty', href: '/introduce' },
      { label: 'Trang thông tin', href: '/trang' },
    ],
  },
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Chính sách', href: '/chinh-sach' },
  { label: 'Tin tức', href: '/news' },
  { label: 'Liên hệ', href: '/contact' },
];

interface CategoryNavBarProps {
  initialCategories?: Category[];
}

/**
 * Thanh điều hướng chính: nút "Danh mục sản phẩm" + các link phụ.
 *
 * Trên TRANG CHỦ, danh sách danh mục không nằm ở đây mà được render thành cột
 * trái ngay trong HomeHero, để danh mục và slide nằm cùng một lưới. Bản trước
 * dùng `position: absolute` cho danh sách rồi chừa chỗ bằng một div rỗng bên
 * hero — hai phần tử độc lập nên không bao giờ khớp nhau, gây ra khoảng trắng
 * lớn bên trái và danh mục đè lên khối nội dung phía dưới.
 */
export default function CategoryNavBar({ initialCategories }: CategoryNavBarProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loadingCats, setLoadingCats] = useState(!initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    if (initialCategories) return;

    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await fetch('/api/categories', { signal: controller.signal });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, [initialCategories]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Đóng khi bấm ra ngoài hoặc nhấn Esc (tiêu chí 5)
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`w-full bg-brand-600 relative ${isOpen ? 'z-50' : 'z-40'}`}>
      {/* Lớp phủ mờ khi menu danh mục đang mở: tách bảng danh mục trắng khỏi
          nội dung trang phía sau, và bấm vào đâu cũng đóng được. Bản trước
          bảng trắng nổi thẳng trên nội dung nên nhìn như dính vào trang. */}
      {isOpen && (
        <div
          className="absolute inset-x-0 top-full h-screen bg-slate-900/40 z-30 hidden lg:block"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch">

        {/* ── Nút mở danh mục (ẩn trên trang chủ vì danh mục đã là cột trái) ── */}
        {!isHome && (
          <div
            ref={wrapperRef}
            className="flex-shrink-0 relative hidden lg:block w-[264px]"
          >
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="category-dropdown"
              className="w-full flex items-center gap-2 bg-brand-700 text-white font-bold uppercase text-sm px-5 min-h-touch py-3 h-full text-left hover:bg-brand-800 transition-colors"
            >
              <i className="ri-menu-line text-lg flex-shrink-0" aria-hidden="true"></i>
              <span className="flex-1">Danh mục sản phẩm</span>
              <i
                className={`ri-arrow-down-s-line text-base flex-shrink-0 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              ></i>
            </button>

            <div
              id="category-dropdown"
              className="absolute top-full left-0 w-[264px] z-40"
              hidden={!isOpen}
            >
              <nav aria-label="Danh mục sản phẩm">
                <ul className="bg-white border border-surface-border shadow-2xl rounded-b-card overflow-hidden max-h-[70vh] overflow-y-auto scrollable-content">
                  {loadingCats
                    ? [...Array(8)].map((_, i) => (
                        <li key={i} className="h-11 border-b border-slate-100 px-4 flex items-center">
                          <span className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                        </li>
                      ))
                    : categories.map((cat) => {
                        const isActive = pathname === `/category/${cat.id}`;
                        return (
                          <li key={cat.id}>
                            <Link
                              href={`/category/${cat.id}`}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex items-center gap-2 min-h-touch px-4 py-2.5 text-sm border-b border-slate-100 transition-colors
                                ${isActive
                                  ? 'bg-brand-50 text-brand-700 font-semibold'
                                  : 'text-slate-700 font-medium hover:bg-brand-50 hover:text-brand-700'
                                }`}
                            >
                              <i className="ri-arrow-right-s-line text-slate-400 flex-shrink-0" aria-hidden="true"></i>
                              <span className="leading-snug">{cat.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* ── Nav links ── */}
        {/* Lớp phủ mờ dần ở mép phải: báo cho khách biết menu còn cuộn tiếp.
            Bản trước cắt cụt giữa chữ ("CH...") mà không có dấu hiệu nào, nên
            khách tưởng chỉ có bấy nhiêu mục (tiêu chí 4). */}
        <div className="relative flex-1 min-w-0">
          <nav aria-label="Điều hướng chính" className="flex items-center overflow-x-auto no-scrollbar scroll-smooth">
            <ul className="flex items-stretch">
            {navLinks.map((link) =>
              link.children ? (
                <NavDropdown key={link.href} link={link} pathname={pathname} />
              ) : (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    className={`${NAV_ITEM} px-5 ${
                      pathname === link.href ? NAV_ACTIVE : NAV_IDLE
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
            </ul>
          </nav>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-600 to-transparent lg:hidden" />
        </div>
      </div>

      {/* ── Mobile + tablet: danh mục cuộn ngang (không ẩn sau hover) ── */}
      <div className="border-t border-white/15 lg:hidden">
        <div className="relative">
        <nav aria-label="Danh mục sản phẩm" className="overflow-x-auto no-scrollbar scroll-smooth">
          <ul className="flex items-center gap-2 px-4 sm:px-6 py-2">
            {loadingCats
              ? [...Array(5)].map((_, i) => (
                  <li key={i} className="h-11 w-28 bg-white/20 rounded-full animate-pulse flex-shrink-0" />
                ))
              : categories.map((cat) => {
                  const isActive = pathname === `/category/${cat.id}`;
                  return (
                    <li key={cat.id} className="flex-shrink-0">
                      <Link
                        href={`/category/${cat.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex items-center min-h-touch px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                          isActive ? 'bg-white text-brand-700' : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  );
                })}
          </ul>
        </nav>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-600 to-transparent" />
        </div>
      </div>
    </div>
  );
}

interface NavChild {
  label: string;
  href: string;
}

/**
 * Mục điều hướng có menu con.
 *
 * Mở bằng CẢ ba cách: rê chuột, bấm, và bàn phím (Enter/Space/mũi tên xuống).
 * Chỉ dùng hover thì người dùng bàn phím và màn hình cảm ứng không mở được —
 * trên điện thoại không có trạng thái "rê chuột" nào cả (tiêu chí 5).
 *
 * Nút cha vẫn giữ link tới trang giới thiệu: bấm vào chữ là đi thẳng, không
 * bắt khách phải chọn thêm một cấp nữa mới tới được nội dung chính.
 */
function NavDropdown({
  link,
  pathname,
}: {
  link: { label: string; href: string; children?: NavChild[] };
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  /*
   * Vị trí bảng menu con, đo từ nút cha.
   *
   * Phải dùng `fixed` + toạ độ đo được chứ không dùng `absolute`: thanh điều
   * hướng này có `overflow-x-auto` để cuộn ngang trên màn hình hẹp, mà phần tử
   * `absolute` nằm trong vùng cuộn sẽ bị CẮT mất — đo ra bảng menu không hề
   * hiện dưới nút, dù trình duyệt vẫn coi nó là "visible".
   */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  /** Đã mở bằng cách BẤM (hoặc bàn phím) → không tự đóng khi chuột rời đi. */
  const [pinned, setPinned] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const children = link.children ?? [];

  /*
   * Mục cha sáng lên khi đang ở chính nó hoặc ở một trang con.
   *
   * Dùng so khớp theo ĐOẠN đường dẫn, không phải startsWith thuần: "/trang"
   * là tiền tố của "/trang-chu", "/trangtri"… nên startsWith sẽ bật sáng nhầm.
   * Đo được lỗi này khi đứng ở /trang mà mục "GIỚI THIỆU" vẫn đậm ngang với
   * nút "Danh mục sản phẩm", nhìn như cả hai cùng được chọn.
   */
  const inSection = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const isActive = inSection(link.href) || children.some((c) => inSection(c.href));

  // Đổi trang thì đóng lại, tránh menu treo lơ lửng sau khi điều hướng.
  useEffect(() => {
    setOpen(false);
    setPinned(false);
  }, [pathname]);

  /*
   * Đo lại vị trí mỗi khi mở, và khi cuộn/đổi kích thước cửa sổ. Bảng dùng
   * `fixed` nên toạ độ tính theo cửa sổ: không đo lại thì khi khách cuộn
   * trang, bảng sẽ đứng yên một chỗ còn nút cha trôi đi mất.
   */
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = itemRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom, left: r.left });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  // Bấm ra ngoài thì đóng.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!itemRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Esc đóng menu và trả tiêu điểm về nút cha (tiêu chí 5).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPinned(false);
        itemRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const menuId = `nav-submenu-${link.href.replace(/\W/g, '')}`;

  return (
    <li
      ref={itemRef}
      /* Nền và vạch đặt trên cả <li> để trải hết chữ LẪN nút mũi tên — đặt
         riêng trên từng phần tử sẽ ra hai mảng màu rời, vạch dưới bị đứt. */
      className={`flex relative ${isActive ? NAV_ACTIVE : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        // Menu được mở bằng CHUỘT BẤM thì giữ nguyên khi chuột rời đi; chỉ
        // menu mở do rê chuột mới tự đóng. Không phân biệt thì thao tác bấm
        // sẽ bị chính trạng thái hover ghi đè và menu không bao giờ mở được.
        if (!pinned) setOpen(false);
      }}
    >
      <Link
        href={link.href}
        aria-current={pathname === link.href ? 'page' : undefined}
        className={`${NAV_ITEM} pl-5 pr-1 ${isActive ? '' : NAV_IDLE}`}
      >
        {link.label}
      </Link>

      <button
        type="button"
        onClick={() => {
          /*
           * Chỉ đóng khi menu đang được GHIM (tức lần bấm trước đã mở nó).
           *
           * Nếu chỉ đảo trạng thái đơn thuần: trên máy tính, di chuột tới nút
           * đã làm menu mở sẵn, cú bấm ngay sau đó lại đóng nó — người dùng
           * bấm mà thấy menu biến mất. Cùng lỗi đó xảy ra trên màn hình cảm
           * ứng vì trình duyệt phát một sự kiện hover ngay trước cú chạm.
           */
          if (pinned) {
            setOpen(false);
            setPinned(false);
          } else {
            setOpen(true);
            setPinned(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setPinned(true);
          }
        }}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${open ? 'Đóng' : 'Mở'} menu con của ${link.label}`}
        /* min-w-touch: bề ngang phải đủ 44px như chiều cao. Đo ra nút chỉ
           34px ngang — ngón tay dễ bấm trượt sang mục bên cạnh (tiêu chí 5). */
        className={`text-white pr-3 pl-1 min-h-touch min-w-touch flex items-center justify-center transition-colors
          ${isActive ? '' : NAV_IDLE}`}
      >
        <i
          className={`ri-arrow-down-s-line text-lg transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && pos && (
        <ul
          id={menuId}
          style={{ top: pos.top, left: pos.left }}
          /* Bóng đổ đậm: bảng này nổi ĐÈ lên cột danh mục phía dưới, thiếu
             bóng thì hai khối trắng dính vào nhau, nhìn như bảng là một phần
             của cột danh mục chứ không phải menu đang mở (tiêu chí 3). */
          className="fixed min-w-[220px] bg-white rounded-b-card shadow-2xl ring-1 ring-slate-900/10 border-t-0 py-1 z-[60]"
        >
          {children.map((child) => {
            const childActive = pathname === child.href;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? 'page' : undefined}
                  className={`flex items-center min-h-touch px-4 text-sm font-medium transition-colors
                    ${childActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-700 hover:bg-surface-sunken hover:text-brand-700'}`}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
