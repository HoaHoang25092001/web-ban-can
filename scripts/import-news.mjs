/**
 * Nhập bài viết từ WordPress cũ, CHỈ giữ các bài có nội dung khác nhau.
 *
 * Chạy:  node scripts/import-news.mjs [--dry-run] [--pages=N]
 *
 * Bối cảnh: trang cũ có 86.328 bài nhưng khảo sát cho thấy 98% là bản sao —
 * cùng một bài được nhân cho từng xã/phường để SEO ("...Ở Hội Phú", "...Ở Long
 * Thọ"). Google phạt nội dung trùng lặp, nhập hết sẽ kéo tụt cả trang mới, nên
 * script chỉ lấy mỗi khuôn nội dung một bài đại diện.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const flags = process.argv.slice(2);
const DRY_RUN = flags.includes('--dry-run');
const pagesFlag = flags.find((f) => f.startsWith('--pages='));
const SAMPLE_COUNT = pagesFlag ? parseInt(pagesFlag.split('=')[1]) : 60;

const BASE = 'https://canvanthinhphat.com/wp-json/wp/v2/posts';
const PER_PAGE = 100;

const clean = (h) => {
  const t = h?.rendered ?? '';
  return t
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#039;|&#8216;/g, "'")
    .replace(/&#8211;|&#8212;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Vân tay nội dung: bỏ dấu và ký tự đặc biệt, lấy 300 ký tự đầu.
 * Hai bài chỉ khác tên địa danh sẽ cho cùng vân tay nên bị coi là một.
 */
const fingerprint = (text) =>
  text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 300);

/**
 * Làm sạch HTML nhưng GIỮ cấu trúc đoạn và tiêu đề.
 *
 * Bản đầu tiên gỡ sạch mọi thẻ rồi gộp thành một chuỗi liền 5.600 ký tự — bài
 * viết biến thành khối chữ đặc không xuống dòng, gần như không đọc nổi
 * (tiêu chí 9: tránh "tường chữ"). HTML gốc vốn có sẵn 54 thẻ <p> và 7 tiêu đề.
 *
 * Nay giữ lại <p>, <h2>, <h3>, <ul>, <li>, <strong> và bỏ mọi thứ còn lại.
 */
function sanitizeHtml(html) {
  return (html ?? '')
    // Bỏ hẳn script/style kèm nội dung bên trong
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Tiêu đề cấp 4-6 hạ xuống h3 cho nhất quán thang bậc (tiêu chí 3)
    .replace(/<h[4-6][^>]*>/gi, '<h3>')
    .replace(/<\/h[4-6]>/gi, '</h3>')
    // Bỏ thuộc tính của các thẻ được giữ, tránh style rác từ web cũ
    .replace(/<(p|h2|h3|ul|ol|li|strong|em|b|i)[^>]*>/gi, '<$1>')
    // Bỏ mọi thẻ KHÔNG nằm trong danh sách cho phép
    .replace(/<(?!\/?(?:p|h2|h3|ul|ol|li|strong|em|b|i)\b)[^>]*>/gi, '')
    // Chuẩn hóa ký tự đặc biệt
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#039;|&#8216;/g, "'")
    .replace(/&#8211;|&#8212;/g, '–')
    // Bỏ đoạn rỗng
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<h[23]>\s*<\/h[23]>/gi, '')
    // Mỗi thẻ một dòng cho dễ đọc khi debug
    .replace(/>\s+</g, '>\n<')
    .trim();
}

/**
 * Cắt phần đuôi SEO khỏi HTML (phiên bản làm việc trên thẻ, không phải text).
 * Duyệt từng đoạn, dừng lại khi gặp đoạn mở đầu bằng dấu hiệu liệt kê địa danh.
 */
function stripSeoTailHtml(html) {
  const blocks = html.split('\n');
  const stopMarkers = [
    /Địa\s*chỉ\s*(bán|sửa|cung cấp)/i,
    /Chúng tôi (nhận|phục vụ|cung cấp).{0,40}(tại|ở) (các|tất cả)/i,
    /(#\w+){3,}/,
  ];
  const out = [];
  for (const b of blocks) {
    if (out.length > 3 && stopMarkers.some((m) => m.test(b))) break;
    out.push(b);
  }
  return out.join('\n');
}

/**
 * Bỏ phần đuôi quảng cáo lặp đi lặp lại ở cuối mỗi bài.
 * Web cũ chèn danh sách hàng trăm địa danh vào cuối bài để SEO — với người đọc
 * thật thì đó là rác, làm bài dài gấp đôi mà không có thông tin gì (tiêu chí 9).
 */
function stripSeoTail(text) {
  const markers = [
    /(Địa\s*chỉ\s*(bán|sửa|cung cấp)[^.]{0,60}(tại|ở))/i,
    /(Chúng tôi (nhận|phục vụ|cung cấp)[^.]{0,40}(tại|ở) (các|tất cả))/i,
    /(#\w+){3,}/,
  ];
  let cut = text.length;
  for (const m of markers) {
    const found = text.search(m);
    if (found > 300 && found < cut) cut = found;
  }
  return text.slice(0, cut).trim();
}

/**
 * Các câu quảng cáo rập khuôn xuất hiện y hệt ở đầu MỌI bài viết.
 * Nếu giữ nguyên, cả 69 thẻ tin tức đều hiện cùng một dòng tóm tắt "Dịch Vụ
 * Công Nghệ Hiện Đại Số – Dịch Vụ Điện Tử Tự Động Hóa…", khách không phân biệt
 * được bài nào với bài nào (tiêu chí 3 & 9).
 */
/**
 * Nhận dạng câu quảng cáo rập khuôn ở đầu bài.
 *
 * Không liệt kê từng câu cụ thể — mỗi bài dùng một biến thể chữ hoa/thường và
 * thứ tự từ khác nhau ("Dịch Vụ Công Nghệ Hiện Đại Số", "DỊCH VỤ CÔNG NGHỆ HIỆN
 * ĐẠI", "Dịch Vụ Công Nghệ Phát Triển"...). Thay vào đó nhận theo ĐẶC ĐIỂM:
 * chuỗi nhiều cụm "Dịch Vụ ..." nối bằng dấu gạch ngang, hoặc các câu cam kết
 * chung chung không mang thông tin riêng của bài.
 */
const BOILERPLATE_PATTERNS = [
  // "Dịch Vụ A – Dịch Vụ B – Dịch Vụ C ..." (từ 2 cụm trở lên)
  /^[^.]{0,80}?(dịch\s*vụ|giao\s*hàng|bảo\s*hành)[^.]{0,200}?[–-][^.]{0,200}?[–-][^.]*\.?/i,
  /^nhân\s*viên\s*(sẽ\s*)?hướng\s*dẫn[^.]*\.?/i,
  /^kiểm\s*định\s*(và|&)\s*hiệu\s*chuẩn[^.]*\.?/i,
  /^cung\s*cấp\s*co\s*cq[^.]*\.?/i,
  /^làm\s*bảng\s*báo\s*giá[^.]*\.?/i,
  /^bảo\s*hành\s*(tận\s*tâm|1\s*đổi\s*1)[^.]*\.?/i,
  /^chúng\s*tôi\s*hoạt\s*động\s*chuyên\s*nghiệp[^.]*\.?/i,
  /^(dịch\s*vụ|giao\s*hàng)\s*[^.]{0,60}(miễn\s*phí|tận\s*nơi|24\/24)[^.]*\.?/i,
];

/** Bỏ các câu mở đầu rập khuôn, giữ phần nội dung riêng của bài. */
function stripBoilerplate(text) {
  let out = text.trimStart();
  let changed = true;
  let guard = 0;
  // Lặp vì các câu rập khuôn nằm liên tiếp nhau ở đầu bài
  while (changed && guard++ < 20) {
    changed = false;
    for (const re of BOILERPLATE_PATTERNS) {
      if (re.test(out)) {
        const next = out.replace(re, '').trimStart();
        // Chỉ chấp nhận nếu còn đủ nội dung — tránh cắt sạch cả bài
        if (next.length > 150) {
          out = next;
          changed = true;
        }
      }
    }
  }
  return out.length > 150 ? out : text;
}

/** Tóm tắt ngắn cho thẻ tin tức: cắt ở ranh giới câu, không đứt giữa chừng. */
function buildExcerpt(text, limit = 220) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (stop > 80 ? cut.slice(0, stop + 1) : cut) + '…';
}

// ── Tải mẫu rải đều khắp dải trang ──────────────────────────────────────────
const head = await fetch(`${BASE}?per_page=1`, { signal: AbortSignal.timeout(60000) });
const total = Number(head.headers.get('x-wp-total') || 0);
const totalPages = Math.ceil(total / PER_PAGE);
console.log(`Trang cũ có ${total.toLocaleString('vi-VN')} bài (${totalPages} trang)`);
console.log(`Sẽ khảo sát ${SAMPLE_COUNT} trang rải đều để tìm bài độc nhất…\n`);

const pages = Array.from({ length: SAMPLE_COUNT }, (_, i) =>
  Math.max(1, Math.round((i / (SAMPLE_COUNT - 1)) * (totalPages - 1)) + 1)
);

const unique = new Map();
let scanned = 0;

for (const page of pages) {
  try {
    const res = await fetch(`${BASE}?per_page=${PER_PAGE}&page=${page}`, {
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) continue;
    const posts = await res.json();
    scanned += posts.length;

    for (const p of posts) {
      const raw = clean(p.content);
      if (raw.length < 200) continue; // bỏ bài rỗng

      const fp = fingerprint(raw);
      if (unique.has(fp)) continue;

      // Nội dung: HTML đã làm sạch, GIỮ đoạn và tiêu đề để bài viết đọc được
      const html = stripSeoTailHtml(sanitizeHtml(p.content?.rendered ?? ''));
      // Tóm tắt: dựng từ text thuần đã bỏ quảng cáo rập khuôn, để mỗi thẻ tin
      // tức hiện một đoạn mở đầu khác nhau
      const meaningful = stripBoilerplate(stripSeoTail(raw));
      unique.set(fp, {
        wpId: p.id,
        title: clean(p.title),
        content: html,
        excerpt: buildExcerpt(meaningful),
        date: p.date,
      });
    }
    process.stdout.write('.');
  } catch {
    process.stdout.write('x');
  }
  await new Promise((r) => setTimeout(r, 200));
}

const items = [...unique.values()].sort((a, b) => new Date(b.date) - new Date(a.date));

console.log('\n');
console.log(`Đã quét ${scanned.toLocaleString('vi-VN')} bài`);
console.log(`Tìm thấy ${items.length} bài có nội dung KHÁC NHAU`);
console.log(`Tỷ lệ trùng lặp: ${(100 - (items.length / scanned) * 100).toFixed(1)}%`);

const avgLen = Math.round(items.reduce((s, i) => s + i.content.length, 0) / items.length);
console.log(`Độ dài trung bình sau khi bỏ đuôi SEO: ${avgLen.toLocaleString('vi-VN')} ký tự`);

if (DRY_RUN) {
  console.log('\n=== 8 bài mẫu ===');
  for (const it of items.slice(0, 8)) {
    console.log(`\n  ${it.title.slice(0, 80)}`);
    console.log(`    ngày : ${it.date.slice(0, 10)} | dài: ${it.content.length} ký tự`);
    console.log(`    tóm  : ${it.excerpt.slice(0, 110)}`);
  }
  console.log('\n[DRY-RUN] Không ghi vào database.');
  await prisma.$disconnect();
  process.exit(0);
}

// ── Ghi vào database ────────────────────────────────────────────────────────
console.log('\nXóa tin tức cũ…');
await prisma.news.deleteMany({});

console.log('Tạo bài viết…');
let created = 0;
for (const it of items) {
  try {
    await prisma.news.create({
      data: {
        title: it.title.slice(0, 500),
        content: it.content,
        excerpt: it.excerpt,
        // Bài trên web cũ không có ảnh đại diện; để trống, admin bổ sung sau
        image: null,
        // Xuất bản luôn để trang Tin tức có nội dung ngay
        published: true,
        createdAt: new Date(it.date),
      },
    });
    created++;
  } catch (e) {
    console.error(`  LỖI "${it.title.slice(0, 40)}": ${e.message.split('\n')[0]}`);
  }
}

console.log(`\nHoàn tất: ${created} bài viết đã nhập.`);
await prisma.$disconnect();
