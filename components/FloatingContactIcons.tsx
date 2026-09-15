import { BUSINESS, PRIMARY_PHONE } from '@/lib/site';

// Server Component – chỉ gồm các link tĩnh, không cần gửi JS xuống trình duyệt.

const ZALO_PHONE = PRIMARY_PHONE.replace(/\./g, '');
const EMAIL = BUSINESS.email;
const MAP_URL = BUSINESS.maps.directions;

export default function FloatingContactIcons() {
  return (
    <>
      {/* ===== RIGHT SIDE: Zalo + Map + Email ===== */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col items-center gap-3">

        {/* Zalo */}
        <a
          href={`https://zalo.me/${ZALO_PHONE}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Liên hệ Zalo"
          className="group relative flex items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
          style={{ width: 52, height: 52 }}
        >
          {/* Zalo pulse ring */}
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping"></span>
          <span className="relative flex items-center justify-center w-full h-full rounded-full bg-blue-500 text-white">
            {/* Zalo SVG icon */}
            <svg viewBox="0 0 50 50" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 3C12.85 3 3 12.85 3 25c0 4.07 1.11 7.88 3.05 11.14L3 47l11.22-3.01A21.93 21.93 0 0025 47c12.15 0 22-9.85 22-22S37.15 3 25 3zm-7.4 14.5h9.1c.55 0 1 .45 1 1s-.45 1-1 1h-6.58l7.98 9.4c.24.28.28.68.1 1s-.54.52-.92.48H17.6c-.55 0-1-.45-1-1s.45-1 1-1h6.8l-7.97-9.38a.998.998 0 01.17-1.5zm16.8 12.5c-.28 0-.56-.12-.76-.34l-3-3.5c-.36-.42-.31-1.05.11-1.41.42-.36 1.05-.31 1.41.11l2.24 2.61 2.24-2.61c.36-.42.99-.47 1.41-.11.42.36.47.99.11 1.41l-3 3.5c-.2.22-.48.34-.76.34z"/>
            </svg>
          </span>
          {/* Tooltip */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat Zalo
          </span>
        </a>

        {/* Map */}
        <a
          href={MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xem bản đồ"
          className="group relative flex items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
          style={{ width: 52, height: 52, backgroundColor: '#34A853' }}
        >
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Xem bản đồ
          </span>
        </a>

        {/* Email */}
        <a
          href={`mailto:${EMAIL}`}
          aria-label="Gửi email"
          className="group relative flex items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
          style={{ width: 52, height: 52, backgroundColor: '#EA4335' }}
        >
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Gửi email
          </span>
        </a>

      </div>
    </>
  );
}
