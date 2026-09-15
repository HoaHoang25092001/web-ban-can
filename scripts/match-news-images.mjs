/**
 * Gán ảnh minh hoạ cho bài viết tin tức.
 *
 * 69 bài nhập từ web cũ đều không có ảnh — web cũ cũng không có
 * (featured_media = 0 và không bài nào nhúng <img>). Thay vì tải ảnh chung
 * chung từ internet (không đúng hàng công ty bán, và vướng bản quyền), script
 * dùng chính 3.174 ảnh sản phẩm thật đã có trên UploadThing.
 *
 * Ghép theo hai tín hiệu lấy từ tiêu đề bài:
 *   1. LOẠI cân  — "cân treo", "tính tiền", "sửa chữa"... → danh mục tương ứng
 *   2. MỨC cân   — "120kg", "3 tấn"... → ưu tiên sản phẩm cùng tải trọng
 *
 * Chạy `node scripts/match-news-images.mjs` để xem trước, thêm `--write` để ghi.
 */
import { PrismaClient } from '@prisma/client';

const WRITE = process.argv.includes('--write');
const prisma = new PrismaClient();

/** Loại cân → id danh mục. Xếp cụ thể trước, chung chung sau: bài
 *  "Cân Điện Tử Tính Tiền 10kg" phải rơi vào Cân tính tiền, không phải
 *  Cân điện tử. */
const TYPE_RULES = [
  { re: /tính\s*tiền|siêu\s*thị|tạp\s*hoá|tạp\s*hóa/i, cat: 18, label: 'Cân tính tiền' },
  // 'móc treo' / 'móc cẩu' cũng là cân treo dù không có cụm 'cân treo'.
  { re: /cân\s*treo|móc\s*treo|móc\s*cẩu/i, cat: 17, label: 'Cân treo điện tử' },
  { re: /cân\s*sàn/i, cat: 19, label: 'Cân sàn điện tử' },
  { re: /cân\s*ghế/i, cat: 14, label: 'Cân ghế điện tử' },
  { re: /xe\s*tải|ô\s*tô|xe\s*hơi/i, cat: 15, label: 'Cân xe tải & ô tô' },
  { re: /phân\s*tích|kỹ\s*thuật|phòng\s*thí\s*nghiệm/i, cat: 20, label: 'Cân phân tích' },
  { re: /thủy\s*sản|tôm|cá\b/i, cat: 25, label: 'Cân thủy sản' },
  { re: /gia\s*súc|heo|bò\b|động\s*vật/i, cat: 22, label: 'Cân gia súc' },
  { re: /đếm|linh\s*kiện/i, cat: 21, label: 'Cân đếm điện tử' },
  { re: /lúa|nông\s*sản|cà\s*phê|tiêu\b|điều\b/i, cat: 26, label: 'Cân nông sản' },
  { re: /cân\s*bàn/i, cat: 12, label: 'Cân bàn điện tử' },
];
const FALLBACK_CAT = 16; // Cân điện tử — danh mục chung, 1.143 ảnh

/**
 * "Sửa chữa" là DỊCH VỤ, không phải loại cân.
 * Bản trước xếp nó thành một luật loại cân đứng đầu danh sách, nên bài
 * "Sửa Chữa Cân TREO Điện Tử" khớp luật sửa chữa rồi dừng — mất luôn thông tin
 * "treo" và nhận ảnh cân lồng heo. Nay nhận diện riêng: vẫn lấy ảnh theo LOẠI
 * cân trong tiêu đề, chỉ dùng danh mục dịch vụ khi không rõ loại nào.
 */
const SERVICE_RE = /sửas*chữa|bảos*trì|kiểms*định/i;

/** Rút mức cân từ tiêu đề: "120kg" → 120, "3 tấn" → 3000 (quy về kg). */
function parseCapacity(title) {
  const tan = title.match(/(\d+(?:[.,]\d+)?)\s*tấn/i);
  if (tan) return Math.round(parseFloat(tan[1].replace(',', '.')) * 1000);
  const kg = title.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kg) return Math.round(parseFloat(kg[1].replace(',', '.')));
  return null;
}

function capacityOf(product) {
  return parseCapacity(`${product.capacity ?? ''} ${product.name ?? ''}`);
}

const news = await prisma.news.findMany({
  select: { id: true, title: true, image: true },
  orderBy: { createdAt: 'desc' },
});

// Nạp sẵn ảnh theo danh mục, tránh truy vấn lại cho từng bài.
const pool = new Map();
for (const catId of [...new Set([...TYPE_RULES.map(r => r.cat), FALLBACK_CAT])]) {
  const rows = await prisma.product.findMany({
    where: { categoryId: catId, NOT: { image: null } },
    select: { id: true, name: true, capacity: true, image: true },
  });
  pool.set(catId, rows);
}

const used = new Set();   // tránh dùng trùng một ảnh cho nhiều bài
const plan = [];
const stats = {};

for (const article of news) {
  const rule = TYPE_RULES.find(r => r.re.test(article.title));
  const isService = SERVICE_RE.test(article.title);
  let catId = rule ? rule.cat : (isService ? 13 : FALLBACK_CAT);
  let label = rule
    ? rule.label + (isService ? ' (bài sửa chữa)' : '')
    : (isService ? 'Sửa chữa & dịch vụ' : 'Cân điện tử (chung)');

  let candidates = pool.get(catId) ?? [];
  // Danh mục quá ít ảnh (Cân nông sản 0, Sửa chữa 3) → lùi về danh mục chung
  // thay vì lặp lại cùng một tấm cho hàng chục bài.
  if (candidates.length < 5) {
    candidates = pool.get(FALLBACK_CAT) ?? [];
    label += ' → dùng ảnh danh mục chung';
    catId = FALLBACK_CAT;
  }

  const want = parseCapacity(article.title);
  let pick = null;

  if (want != null) {
    /* Ưu tiên sản phẩm ĐÚNG tải trọng.
     * Bản trước đòi ảnh phải chưa dùng, nên bài "Sửa Chữa Cân Treo 500 kg"
     * mất tấm "Cân Treo Điện Tử 500 kg" vào tay một bài duyệt trước rồi nhận
     * ảnh cân lồng heo. Với 69 bài, ảnh ĐÚNG nội dung quan trọng hơn việc
     * tuyệt đối không lặp — nên nếu không còn tấm đúng mức nào chưa dùng thì
     * chấp nhận dùng lại. */
    const exactAll = candidates.filter(c => capacityOf(c) === want);
    const exactFree = exactAll.filter(c => !used.has(c.image));
    pick = exactFree[0] ?? exactAll[0] ?? null;
    if (!pick) {
      // Không có đúng mức → lấy mức gần nhất.
      const scored = candidates
        .filter(c => !used.has(c.image) && capacityOf(c) != null)
        .map(c => ({ c, d: Math.abs(capacityOf(c) - want) }))
        .sort((a, b) => a.d - b.d);
      if (scored.length) pick = scored[0].c;
    }
  }
  if (!pick) {
    /* Không rõ mức cân. Bản trước lấy `candidates[0]` — luôn là sản phẩm đầu
     * danh sách, nên hàng chục bài dồn vào một nhóm ảnh giống hệt nhau. Nay
     * rải theo id bài: ổn định giữa các lần chạy, nhưng trải đều cả kho. */
    const free = candidates.filter(c => !used.has(c.image));
    const list = free.length ? free : candidates;
    pick = list[article.id % list.length];
  }
  if (!pick) { console.log(`  ⚠ không tìm được ảnh: ${article.title}`); continue; }

  used.add(pick.image);
  stats[label] = (stats[label] || 0) + 1;
  plan.push({ id: article.id, image: pick.image, title: article.title,
              from: pick.name, want, got: capacityOf(pick) });
}

console.log(`\n═══ ${WRITE ? 'ĐANG GHI' : 'XEM TRƯỚC (chưa ghi)'} — ${plan.length}/${news.length} bài ═══\n`);
for (const x of plan.slice(0, 15)) {
  const cap = x.want != null ? `${x.want}kg→${x.got ?? '?'}kg` : 'không rõ mức';
  console.log(`  ${x.title.slice(0, 46).padEnd(46)} [${cap}]  ← ${x.from.slice(0, 40)}`);
}
if (plan.length > 15) console.log(`  … và ${plan.length - 15} bài nữa`);
console.log('\nPhân bổ theo loại:');
for (const [k, v] of Object.entries(stats).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)} × ${k}`);
console.log(`\nSố ảnh dùng lại (trùng): ${plan.length - new Set(plan.map(p => p.image)).size}`);

if (WRITE) {
  let done = 0;
  for (const x of plan) {
    await prisma.news.update({ where: { id: x.id }, data: { image: x.image } });
    done++;
  }
  console.log(`\n✓ Đã cập nhật ${done} bài.`);
} else {
  console.log('\nThêm --write để ghi vào database.');
}
await prisma.$disconnect();
