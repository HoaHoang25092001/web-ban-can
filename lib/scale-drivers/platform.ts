/**
 * Nhận biết thiết bị đang mở trang, để nói ĐÚNG lý do khi không kết nối được
 * cân và cách khắc phục cụ thể cho từng máy.
 *
 * Web Serial (đọc số từ cân) chạy được trên:
 *   - Chrome / Edge bản máy tính (Windows, macOS, Linux, ChromeOS).
 *   - Chrome trên Android từ bản 148 (4/2026), cho cả cân cắm cáp USB (qua
 *     cáp OTG) lẫn cân Bluetooth giả lập cổng nối tiếp.
 * KHÔNG chạy trên: mọi trình duyệt trên iPhone/iPad (Apple chặn), Firefox,
 * Safari, Samsung Internet.
 *
 * Chỉ dùng để chọn câu hướng dẫn. Việc có kết nối được hay không vẫn kiểm
 * tra bằng `"serial" in navigator`, không đoán theo tên trình duyệt.
 */

export const ANDROID_MIN_CHROME = 148;

export type Platform = {
  os: 'android' | 'ios' | 'desktop';
  /** Chrome thật (không tính Edge, Samsung Internet, Opera — chúng cũng ghi "Chrome/" trong UA). */
  isChrome: boolean;
  chromeVersion: number | null;
};

export function detectPlatform(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): Platform {
  const os = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && /Mobile/.test(ua))
    ? 'ios'
    : /Android/i.test(ua)
      ? 'android'
      : 'desktop';
  const otherChromium = /SamsungBrowser|EdgA?\/|OPR\/|Opera|YaBrowser|UCBrowser|CocCoc|coc_coc/i.test(ua);
  const m = ua.match(/Chrome\/(\d+)/);
  return {
    os,
    isChrome: Boolean(m) && !otherChromium,
    chromeVersion: m ? Number(m[1]) : null,
  };
}

/**
 * Câu giải thích khi trình duyệt KHÔNG đọc được cân. Luôn kèm lối đi tiếp:
 * cách làm cho đọc được, hoặc nhập tay.
 */
export function unsupportedReason(p: Platform): { title: string; fix: string } {
  if (p.os === 'ios') {
    return {
      title: 'iPhone và iPad không đọc số tự động từ cân được.',
      fix: 'Apple chưa cho trình duyệt nào trên iPhone/iPad kết nối với cân. Vẫn cân được bằng cách gõ tay số trên màn hình cân, hoặc dùng điện thoại Android hay máy tính.',
    };
  }
  if (p.os === 'android') {
    if (!p.isChrome) {
      return {
        title: 'Trình duyệt này chưa đọc được cân.',
        fix: 'Hãy mở trang bằng ứng dụng Google Chrome (không dùng Samsung Internet, Cốc Cốc, Firefox). Trong lúc đó vẫn cân được bằng cách gõ tay số trên màn hình cân.',
      };
    }
    return {
      title: `Chrome trên máy này đã cũ (bản ${p.chromeVersion ?? '?'}), chưa đọc được cân.`,
      fix: `Mở CH Play, tìm "Google Chrome" và bấm Cập nhật (cần bản ${ANDROID_MIN_CHROME} trở lên), rồi mở lại trang này. Trong lúc đó vẫn cân được bằng cách gõ tay.`,
    };
  }
  return {
    title: 'Trình duyệt này không đọc số tự động từ cân được.',
    fix: 'Hãy mở trang bằng Google Chrome hoặc Microsoft Edge. Trong lúc đó vẫn cân được bằng cách gõ tay số trên màn hình cân.',
  };
}
