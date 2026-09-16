/**
 * Thay số điện thoại cũ trong NỘI DUNG bài viết và mô tả sản phẩm.
 *
 * Dữ liệu nhập từ website cũ có số hotline nằm lẫn trong thân bài (69 bài viết
 * và 31 sản phẩm). Đổi số trong lib/site.ts chỉ cập nhật phần giao diện —
 * những số nằm trong nội dung vẫn là số cũ, khách đọc bài rồi gọi vào số
 * không còn dùng.
 *
 *   node scripts/replace-phone.mjs          → xem trước, KHÔNG ghi
 *   node scripts/replace-phone.mjs --write  → ghi vào database
 */
import { PrismaClient } from '@prisma/client';

const WRITE = process.argv.includes('--write');
const prisma = new PrismaClient();

const NEW_PLAIN = '0369759187';
const NEW_DOTTED = '0369.759.187';

// Xếp dạng có dấu chấm trước để không bị dạng liền số "ăn" mất một phần.
const RULES = [
  ['0911.093.511', NEW_DOTTED],
  ['0923.051.134', NEW_DOTTED],
  ['0911093511',   NEW_PLAIN],
  ['0923051134',   NEW_PLAIN],
  ['0911 093 511', NEW_DOTTED],
  ['0923 051 134', NEW_DOTTED],
];

const swap = (text) => {
  if (!text) return { value: text, changed: false };
  let out = text;
  for (const [from, to] of RULES) out = out.split(from).join(to);
  return { value: out, changed: out !== text };
};

let newsCount = 0, productCount = 0;

// ── Tin tức ──
const news = await prisma.news.findMany({ select: { id: true, title: true, content: true, excerpt: true } });
for (const n of news) {
  const c = swap(n.content), e = swap(n.excerpt), t = swap(n.title);
  if (!c.changed && !e.changed && !t.changed) continue;
  newsCount++;
  if (WRITE) {
    await prisma.news.update({
      where: { id: n.id },
      data: { content: c.value, excerpt: e.value, title: t.value },
    });
  }
}

// ── Sản phẩm ──
const products = await prisma.product.findMany({ select: { id: true, name: true, description: true } });
for (const p of products) {
  const d = swap(p.description), nm = swap(p.name);
  if (!d.changed && !nm.changed) continue;
  productCount++;
  if (WRITE) {
    await prisma.product.update({
      where: { id: p.id },
      data: { description: d.value, name: nm.value },
    });
  }
}

console.log(`${WRITE ? 'Đã cập nhật' : 'Sẽ cập nhật'}: ${newsCount} bài viết, ${productCount} sản phẩm`);
if (!WRITE) console.log('Thêm --write để ghi vào database.');

await prisma.$disconnect();
