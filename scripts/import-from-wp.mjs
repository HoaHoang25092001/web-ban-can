/**
 * Nhập sản phẩm từ website WordPress cũ (canvanthinhphat.com) vào database mới.
 *
 * Chạy:  node scripts/import-from-wp.mjs <đường-dẫn-file-json> [--dry-run]
 *
 *   --dry-run : chỉ phân tích và in kết quả, KHÔNG ghi vào database.
 *
 * Quy trình:
 *   1. Đọc file JSON đã tải từ WP REST API
 *   2. Bỏ bản ghi trùng tên (giữ bản mới nhất)
 *   3. Suy ra danh mục từ tên sản phẩm
 *   4. Tách thông số kỹ thuật (mức cân, hãng, xuất xứ) từ nội dung mô tả
 *   5. Xóa dữ liệu cũ rồi ghi dữ liệu mới
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();
const [, , filePath, ...flags] = process.argv;
const DRY_RUN = flags.includes('--dry-run');

if (!filePath) {
  console.error('Thiếu đường dẫn file JSON.');
  process.exit(1);
}

/** Gỡ thẻ HTML và giải mã các ký tự đặc biệt để lấy văn bản thuần. */
function toText(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#039;|&#8216;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;|&#8212;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Bộ quy tắc phân loại — xét theo thứ tự, khớp đầu tiên thì lấy.
 * Đặt các loại cụ thể lên trước loại chung ("cân điện tử" khớp gần như mọi tên
 * nên phải để cuối cùng, nếu không mọi sản phẩm sẽ rơi hết vào đó).
 */
const CATEGORY_RULES = [
  { name: 'Cân tính tiền', patterns: [/cân\s*tính\s*tiền/i, /cân\s*siêu\s*thị/i] },
  { name: 'Cân bàn điện tử', patterns: [/cân\s*bàn/i] },
  { name: 'Cân sàn điện tử', patterns: [/cân\s*sàn/i] },
  { name: 'Cân treo điện tử', patterns: [/cân\s*treo/i, /cân\s*móc/i] },
  { name: 'Cân xe tải & ô tô', patterns: [/cân\s*xe/i, /cân\s*ô\s*tô/i, /trạm\s*cân/i] },
  { name: 'Cân ghế điện tử', patterns: [/cân\s*ghế/i] },
  { name: 'Cân thủy sản', patterns: [/cân\s*thủy\s*sản/i, /cân\s*cá/i] },
  { name: 'Cân gia súc & động vật', patterns: [/cân\s*gia\s*súc/i, /cân\s*động\s*vật/i, /cân\s*heo/i, /cân\s*thú/i] },
  { name: 'Cân nông sản', patterns: [/cân\s*nông\s*sản/i, /cân\s*lúa/i] },
  { name: 'Cân phân tích & kỹ thuật', patterns: [/cân\s*phân\s*tích/i, /cân\s*kỹ\s*thuật/i, /cân\s*vàng/i] },
  { name: 'Cân nhà bếp', patterns: [/cân\s*nhà\s*bếp/i] },
  { name: 'Cân y tế', patterns: [/cân\s*y\s*tế/i, /cân\s*sức\s*khỏe/i] },
  { name: 'Cân đếm điện tử', patterns: [/cân\s*đếm/i] },
  { name: 'Sửa chữa & dịch vụ', patterns: [/sửa\s*chữa/i, /dịch\s*vụ/i, /kiểm\s*định/i] },
  { name: 'Phụ kiện ngành cân', patterns: [/phụ\s*kiện/i, /loadcell/i, /đầu\s*cân/i, /indicator/i] },
  // Khớp cuối cùng: mọi sản phẩm còn lại
  { name: 'Cân điện tử', patterns: [/cân/i] },
];

function detectCategory(title) {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(title))) return rule.name;
  }
  return 'Sản phẩm khác';
}

/** Tách mức cân từ tên, ví dụ "40kg/ 50kg/ 100kg" → "40kg – 100kg". */
function extractCapacity(title) {
  const matches = [...title.matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|g|tấn|tan)\b/gi)];
  if (matches.length === 0) return null;

  const toKg = (v, unit) => {
    const n = parseFloat(String(v).replace(',', '.'));
    if (/tấn|tan/i.test(unit)) return n * 1000;
    if (/^g$/i.test(unit)) return n / 1000;
    return n;
  };
  const values = matches.map((m) => ({ raw: `${m[1]}${m[2].toLowerCase()}`, kg: toKg(m[1], m[2]) }));
  values.sort((a, b) => a.kg - b.kg);

  if (values.length === 1) return values[0].raw;
  const min = values[0].raw;
  const max = values[values.length - 1].raw;
  return min === max ? min : `${min} – ${max}`;
}

/**
 * Nhận diện hãng sản xuất.
 *
 * Ưu tiên đọc thẳng trường "Thương Hiệu : X" mà web cũ ghi trong mô tả — đây là
 * dữ liệu do người bán nhập nên chính xác nhất. Chỉ khi không có mới dò từ khóa.
 *
 * Lưu ý: không dò các tên hãng quá ngắn như "AND", "CAS" bằng includes() vì
 * chúng khớp nhầm bên trong từ khác ("brAND", "CAS" trong "CASE"), khiến hàng
 * loạt sản phẩm bị gán sai hãng.
 */
const BRAND_PATTERNS = [
  [/YAO\s*HUA|YAOHUA/i, 'YAOHUA'],
  [/OHAUS/i, 'OHAUS'],
  [/SHINKO/i, 'SHINKO'],
  [/VIBRA/i, 'VIBRA'],
  [/JADEVER/i, 'JADEVER'],
  [/SHIMADZU/i, 'SHIMADZU'],
  [/METTLER/i, 'METTLER TOLEDO'],
  [/TANITA/i, 'TANITA'],
  [/EXCELL/i, 'EXCELL'],
  [/T-?SCALE|TSCALE/i, 'T-SCALE'],
  [/\bDIGI\b/i, 'DIGI'],
  [/\bUTE\b/i, 'UTE'],
  [/\bCAS\b/i, 'CAS'],
  [/\bTPS\b/i, 'TPS'],
  [/\bXK3190\b/i, 'XK3190'],
];

function extractManufacturer(text) {
  // 1. Đọc trường "Thương Hiệu : X" (đáng tin nhất — do người bán nhập)
  const labeled = text.match(/Thương\s*Hiệu\s*:?\s*([A-Za-zÀ-ỹ0-9\s,&-]{2,60}?)\s*(?:\.|Tình\s*Trạng|Bảo\s*Hành|Model|MODEL|Xuất\s*Xứ|$)/i);
  if (labeled) {
    const val = labeled[1].trim().replace(/\s+/g, ' ');

    /*
     * Trang dịch vụ (sửa chữa, kiểm định) liệt kê hàng loạt hãng mà họ nhận
     * làm: "CAS, DIGI, AND, METTLER TOLEDO…". Đó không phải hãng sản xuất của
     * một sản phẩm cụ thể, nên bỏ qua thay vì lấy bừa cái đầu tiên.
     */
    if (val.includes(',')) return null;

    if (val.length >= 2 && val.length <= 25) {
      for (const [re, name] of BRAND_PATTERNS) if (re.test(val)) return name;

      /*
       * Loại các cụm mô tả bị nhầm là tên hãng. Web cũ hay viết
       * "Thương Hiệu : Chính Hãng" hoặc "Thương Hiệu : Nhập Khẩu" — đó là lời
       * quảng cáo, không phải tên nhà sản xuất, đưa lên trang sản phẩm sẽ vô
       * nghĩa với khách.
       */
      const NOT_A_BRAND = /^(chính\s*hãng|nhập\s*khẩu|cao\s*cấp|đang\s*cập\s*nhật|liên\s*hệ|khác|nhiều\s*hãng|tất\s*cả)$/i;
      if (NOT_A_BRAND.test(val)) return null;

      return val.toUpperCase();
    }
  }

  // 2. Không có nhãn: chỉ dò trong TÊN sản phẩm, không dò cả bài mô tả —
  //    phần giới thiệu chung hay nhắc nhiều hãng, dò cả bài sẽ gán sai.
  return null;
}

/**
 * Nhận diện xuất xứ.
 * Cũng ưu tiên trường "Xuất Xứ : X" do người bán ghi. Tránh dò cả bài vì mô tả
 * thường nhắc nhiều nước trong phần giới thiệu chung, dẫn tới gán sai (ví dụ
 * bài "Sửa chữa cân" bị gán Đài Loan chỉ vì có nhắc tới hàng Đài Loan).
 */
const ORIGIN_PATTERNS = [
  [/đài\s*loan|taiwan/i, 'Đài Loan'],
  [/nhật\s*bản|japan/i, 'Nhật Bản'],
  [/hàn\s*quốc|korea/i, 'Hàn Quốc'],
  [/trung\s*quốc|china/i, 'Trung Quốc'],
  [/việt\s*nam|vietnam/i, 'Việt Nam'],
  [/\bmỹ\b|hoa\s*kỳ|\busa\b/i, 'Mỹ'],
];

function extractOrigin(text) {
  const labeled = text.match(/Xuất\s*Xứ\s*:?\s*([A-Za-zÀ-ỹ\s]{2,20}?)\s*(?:\.|,|Tình\s*Trạng|Bảo\s*Hành|Thương\s*Hiệu|$)/i);
  if (labeled) {
    const val = labeled[1].trim();
    for (const [re, name] of ORIGIN_PATTERNS) if (re.test(val)) return name;
    if (val.length >= 2 && val.length <= 20) return val;
  }
  return null;
}

/** Rút gọn mô tả thành đoạn ngắn dễ đọc, tránh "tường chữ" (tiêu chí 9). */
function buildDescription(contentText, excerptText) {
  const source = excerptText.length > 40 ? excerptText : contentText;
  if (!source) return null;
  // Cắt ở ranh giới câu gần nhất để không đứt giữa chừng
  const limit = 600;
  if (source.length <= limit) return source;
  const cut = source.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (lastStop > 200 ? cut.slice(0, lastStop + 1) : cut) + '…';
}

// ── 1. Đọc dữ liệu ──────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync(filePath, 'utf8'));
console.log(`Đọc ${raw.length} bản ghi từ ${filePath}`);

// ── 2. Bỏ trùng tên, giữ bản mới nhất ───────────────────────────────────────
const byTitle = new Map();
for (const p of raw) {
  const title = toText(p.title);
  if (!title) continue;
  const key = title.toLowerCase().replace(/\s+/g, ' ').trim();
  const existing = byTitle.get(key);
  if (!existing || new Date(p.date) > new Date(existing.date)) {
    byTitle.set(key, p);
  }
}
const unique = [...byTitle.values()];
console.log(`Sau khi bỏ trùng tên: ${unique.length} sản phẩm (loại ${raw.length - unique.length} bản trùng)`);

// ── 3. Chuẩn hóa từng sản phẩm ──────────────────────────────────────────────
const items = unique.map((p) => {
  const title = toText(p.title);
  const contentText = toText(p.content);
  const excerptText = toText(p.excerpt);
  // Gộp cả content lẫn excerpt: nhiều sản phẩm đặt bảng thông số
  // ("Thương Hiệu : …", "Xuất Xứ : …") ở excerpt chứ không phải content.
  const specText = `${contentText} ${excerptText}`;

  // Hãng: ưu tiên trường có nhãn trong mô tả, nếu không có thì dò trong TÊN
  // sản phẩm (tên thường chứa mã model kèm hãng, ví dụ "Cân Bàn A12E YAOHUA").
  const brandFromSpec = extractManufacturer(specText);
  const brandFromTitle = BRAND_PATTERNS.find(([re]) => re.test(title))?.[1] ?? null;

  return {
    wpId: p.id,
    name: title,
    categoryName: detectCategory(title),
    description: buildDescription(contentText, excerptText),
    capacity: extractCapacity(title),
    manufacturer: brandFromSpec ?? brandFromTitle,
    origin: extractOrigin(specText),
    mediaId: p.featured_media || 0,
    date: p.date,
  };
});

// ── 4. Thống kê ─────────────────────────────────────────────────────────────
const catCount = {};
let coCapacity = 0, coBrand = 0, coOrigin = 0, coAnh = 0, coMota = 0;
for (const it of items) {
  catCount[it.categoryName] = (catCount[it.categoryName] || 0) + 1;
  if (it.capacity) coCapacity++;
  if (it.manufacturer) coBrand++;
  if (it.origin) coOrigin++;
  if (it.mediaId) coAnh++;
  if (it.description) coMota++;
}

console.log('\n=== Phân loại danh mục ===');
Object.entries(catCount).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)} | ${k}`));

console.log('\n=== Độ đầy đủ dữ liệu ===');
const pct = (n) => `${((n / items.length) * 100).toFixed(1)}%`;
console.log(`  có mô tả      : ${coMota} (${pct(coMota)})`);
console.log(`  có mức cân    : ${coCapacity} (${pct(coCapacity)})`);
console.log(`  có hãng       : ${coBrand} (${pct(coBrand)})`);
console.log(`  có xuất xứ    : ${coOrigin} (${pct(coOrigin)})`);
console.log(`  có ảnh        : ${coAnh} (${pct(coAnh)})`);

if (DRY_RUN) {
  console.log('\n=== 5 sản phẩm mẫu ===');
  for (const it of items.slice(0, 5)) {
    console.log(`\n  ${it.name}`);
    console.log(`    danh mục : ${it.categoryName}`);
    console.log(`    mức cân  : ${it.capacity ?? '(không có)'}`);
    console.log(`    hãng     : ${it.manufacturer ?? '(không có)'} | xuất xứ: ${it.origin ?? '(không có)'}`);
    console.log(`    mô tả    : ${(it.description ?? '').slice(0, 100)}…`);
  }
  console.log('\n[DRY-RUN] Không ghi vào database.');
  await prisma.$disconnect();
  process.exit(0);
}

// ── 5. Ghi vào database ─────────────────────────────────────────────────────

/**
 * Thử lại khi mất kết nối.
 *
 * Neon (Postgres serverless) đóng kết nối sau các thao tác nặng như xóa hàng
 * loạt, trả về lỗi P1017. Đây là hành vi bình thường của dịch vụ, không phải
 * lỗi dữ liệu — chỉ cần kết nối lại rồi chạy tiếp.
 */
async function withRetry(label, fn, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (e) {
      const transient =
        e?.code === 'P1017' || e?.code === 'P1001' || e?.code === 'P2024' ||
        /closed the connection|Timed out|ECONNRESET/i.test(e?.message ?? '');
      if (!transient || i === tries) throw e;

      const wait = 1500 * i;
      console.log(`  ⟳ ${label}: mất kết nối, thử lại sau ${wait}ms (lần ${i}/${tries})`);
      try { await prisma.$disconnect(); } catch {}
      await new Promise((r) => setTimeout(r, wait));
      await prisma.$connect();
    }
  }
}

console.log('\nXóa dữ liệu sản phẩm và danh mục cũ…');
await withRetry('xóa sản phẩm', () => prisma.product.deleteMany({}));
await withRetry('xóa danh mục', () => prisma.category.deleteMany({}));

console.log('Tạo danh mục…');
const categoryIds = new Map();
for (const name of Object.keys(catCount)) {
  const cat = await withRetry(`danh mục "${name}"`, () =>
    prisma.category.create({ data: { name } })
  );
  categoryIds.set(name, cat.id);
}
console.log(`  đã tạo ${categoryIds.size} danh mục`);

console.log('Tạo sản phẩm…');
let created = 0;
// Lô 100 bản ghi: đủ nhanh mà không làm Neon ngắt kết nối giữa chừng
const BATCH = 100;
for (let i = 0; i < items.length; i += BATCH) {
  const chunk = items.slice(i, i + BATCH);
  await withRetry(`lô ${i / BATCH + 1}`, () =>
    prisma.product.createMany({
      data: chunk.map((it) => ({
        name: it.name.slice(0, 500),
        description: it.description,
        categoryId: categoryIds.get(it.categoryName),
        capacity: it.capacity,
        manufacturer: it.manufacturer,
        origin: it.origin,
        featured: false,
        images: [],
        // Ảnh nhập ở bước sau (script import-images.mjs)
        image: null,
      })),
    })
  );
  created += chunk.length;
  if (created % 500 === 0 || created === items.length) {
    console.log(`  đã tạo ${created}/${items.length}`);
  }
}

console.log(`\nHoàn tất: ${created} sản phẩm, ${categoryIds.size} danh mục.`);
await prisma.$disconnect();
