/**
 * Tải ảnh sản phẩm từ website cũ về UploadThing, rồi gán URL mới vào database.
 *
 * Chạy:  node scripts/import-images.mjs <file-json> [--limit=N] [--dry-run]
 *
 * Vì sao tải về thay vì giữ link web cũ: ảnh trở thành tài sản của bạn, không
 * hỏng khi website cũ ngừng hoạt động hay đổi đường dẫn.
 *
 * Script chạy lại được nhiều lần: sản phẩm đã có ảnh sẽ được bỏ qua, nên nếu
 * bị ngắt giữa chừng chỉ cần chạy lại là tiếp tục từ chỗ dở.
 */
import { PrismaClient } from '@prisma/client';
import { UTApi } from 'uploadthing/server';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();
const utapi = new UTApi();

const [, , filePath, ...flags] = process.argv;
const DRY_RUN = flags.includes('--dry-run');
const limitFlag = flags.find((f) => f.startsWith('--limit='));
const LIMIT = limitFlag ? parseInt(limitFlag.split('=')[1]) : Infinity;

if (!filePath) {
  console.error('Thiếu đường dẫn file JSON.');
  process.exit(1);
}

const WP_MEDIA = 'https://canvanthinhphat.com/wp-json/wp/v2/media';
const CONCURRENCY = 4; // số ảnh xử lý song song — vừa đủ nhanh, không ép server cũ

function toText(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/** Lấy URL ảnh gốc từ media id của WordPress. */
async function getMediaUrl(mediaId) {
  try {
    const res = await fetch(`${WP_MEDIA}/${mediaId}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const m = await res.json();
    // Ưu tiên bản "medium_large" (~768px) — đủ nét cho card sản phẩm mà nhẹ hơn
    // ảnh gốc nhiều lần, giảm thời gian tải và dung lượng lưu trữ.
    return (
      m?.media_details?.sizes?.medium_large?.source_url ||
      m?.media_details?.sizes?.large?.source_url ||
      m?.source_url ||
      null
    );
  } catch {
    return null;
  }
}

/** Tải ảnh về bộ nhớ rồi đẩy lên UploadThing, trả về URL mới. */
async function transferImage(imageUrl, fileName) {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`tải ảnh lỗi HTTP ${res.status}`);

  const type = res.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) throw new Error(`không phải ảnh (${type})`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error('ảnh rỗng');

  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const file = new File([buf], `${fileName}.${ext}`, { type });

  const uploaded = await utapi.uploadFiles(file);
  if (uploaded.error) throw new Error(uploaded.error.message);
  return uploaded.data.ufsUrl ?? uploaded.data.url;
}

// ── Ghép sản phẩm trong database với media id từ file JSON ──────────────────
const raw = JSON.parse(readFileSync(filePath, 'utf8'));
const mediaByName = new Map();
for (const p of raw) {
  const name = toText(p.title);
  if (name && p.featured_media) {
    // Giữ bản mới nhất nếu trùng tên, khớp với cách import-from-wp.mjs bỏ trùng
    const cur = mediaByName.get(name);
    if (!cur || new Date(p.date) > new Date(cur.date)) {
      mediaByName.set(name, { mediaId: p.featured_media, date: p.date });
    }
  }
}
console.log(`File JSON có ${mediaByName.size} sản phẩm kèm ảnh`);

const products = await prisma.product.findMany({
  where: { image: null },
  select: { id: true, name: true },
});
console.log(`Database có ${products.length} sản phẩm chưa có ảnh`);

const targets = products
  .map((p) => ({ ...p, media: mediaByName.get(p.name) }))
  .filter((p) => p.media)
  .slice(0, LIMIT);

console.log(`Sẽ xử lý ${targets.length} sản phẩm\n`);

if (DRY_RUN) {
  for (const t of targets.slice(0, 5)) {
    const url = await getMediaUrl(t.media.mediaId);
    console.log(`  ${t.name.slice(0, 55)}…`);
    console.log(`    → ${url ?? '(không lấy được URL)'}`);
  }
  console.log('\n[DRY-RUN] Không upload, không ghi database.');
  await prisma.$disconnect();
  process.exit(0);
}

let ok = 0, fail = 0, done = 0;

async function processOne(t) {
  try {
    const srcUrl = await getMediaUrl(t.media.mediaId);
    if (!srcUrl) throw new Error('không lấy được URL ảnh gốc');

    const newUrl = await transferImage(srcUrl, `product-${t.id}`);
    await prisma.product.update({
      where: { id: t.id },
      data: { image: newUrl, images: [newUrl] },
    });
    ok++;
  } catch (e) {
    fail++;
    if (fail <= 10) console.error(`  LỖI [${t.id}] ${t.name.slice(0, 40)}: ${e.message}`);
  } finally {
    done++;
    if (done % 25 === 0 || done === targets.length) {
      console.log(`  tiến độ ${done}/${targets.length} — thành công ${ok}, lỗi ${fail}`);
    }
  }
}

// Chạy song song có giới hạn: nhiều luồng cùng rút việc từ một hàng đợi
const queue = [...targets];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const t = queue.shift();
      if (t) await processOne(t);
    }
  })
);

console.log(`\nHoàn tất: ${ok} ảnh tải thành công, ${fail} lỗi.`);
await prisma.$disconnect();
