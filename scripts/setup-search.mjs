/**
 * Chuẩn bị database cho tìm kiếm không dấu.
 *
 * Khách hàng thường gõ "can ban" thay vì "cân bàn". Trước khi sửa, truy vấn
 * `contains` của Prisma so khớp nguyên văn nên "can ban" trả về 0 kết quả trong
 * khi có hơn 1.200 sản phẩm phù hợp — khách tưởng cửa hàng không có hàng.
 *
 * Giải pháp: dùng extension `unaccent` của Postgres để bỏ dấu cả hai vế khi so
 * khớp, kèm index GIN để không phải quét toàn bảng 3.226 bản ghi.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const steps = [
  ['Bật extension unaccent', 'CREATE EXTENSION IF NOT EXISTS unaccent'],
  ['Bật extension pg_trgm (tìm gần đúng)', 'CREATE EXTENSION IF NOT EXISTS pg_trgm'],
  /*
   * unaccent() mặc định là STABLE nên không dùng trực tiếp trong index được.
   * Bọc trong một hàm IMMUTABLE để Postgres chấp nhận.
   */
  ['Tạo hàm bỏ dấu bất biến', `
    CREATE OR REPLACE FUNCTION immutable_unaccent(text)
    RETURNS text AS $$
      SELECT public.unaccent('public.unaccent'::regdictionary, $1)
    $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  `],
  ['Tạo index tìm kiếm theo tên', `
    CREATE INDEX IF NOT EXISTS products_name_unaccent_idx
    ON products USING gin (immutable_unaccent(lower(name)) gin_trgm_ops)
  `],
];

for (const [label, sql] of steps) {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log('  ✓', label);
  } catch (e) {
    console.error('  ✗', label, '—', e.message.split('\n')[0]);
  }
}

// Kiểm chứng ngay: gõ không dấu có ra kết quả không
const rows = await prisma.$queryRawUnsafe(`
  SELECT COUNT(*)::int AS n FROM products
  WHERE immutable_unaccent(lower(name)) LIKE immutable_unaccent(lower('%can ban%'))
`);
console.log('\nThử tìm "can ban" (không dấu):', rows[0].n, 'kết quả');

await prisma.$disconnect();
