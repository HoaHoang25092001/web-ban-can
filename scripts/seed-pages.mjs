/**
 * Tạo vài trang MẪU để thử phần "Trang".
 *
 *   node scripts/seed-pages.mjs          → thêm dữ liệu
 *   node scripts/seed-pages.mjs --clear  → xoá sạch dữ liệu mẫu
 *
 * Tiêu đề đều có tiền tố "[MẪU]" để không nhầm với trang thật và xoá đi dễ
 * dàng. Nội dung viết sát kiểu trang SEO theo tỉnh của website cũ, nhưng
 * KHÔNG phải nội dung chính thức của công ty — đừng để lẫn khi chạy thật.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MARK = '[MẪU]';

const removeTones = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

const slugify = (s) =>
  removeTones(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120);

const SAMPLES = [
  {
    title: 'Bán cân điện tử giá rẻ tại Quy Nhơn',
    excerpt:
      'Cung cấp cân bàn, cân sàn, cân treo điện tử tại Quy Nhơn và các huyện lân cận. Giao lắp tận nơi, bảo hành 12 tháng.',
    published: true,
    content: `
<p>Cân Vạn Thịnh Phát cung cấp các dòng cân điện tử chính hãng cho khách hàng tại <strong>Quy Nhơn, Bình Định</strong>: cân bàn, cân sàn, cân treo, cân tính tiền và cân kỹ thuật.</p>
<h2>Các dòng cân phù hợp với khu vực Quy Nhơn</h2>
<ul>
  <li><strong>Cân sàn 1–5 tấn</strong> — dùng cho kho hàng, cảng cá, cơ sở thu mua nông sản.</li>
  <li><strong>Cân treo 300kg–2 tấn</strong> — cân hàng rời, thuỷ hải sản tại bến.</li>
  <li><strong>Cân bàn 30–300kg</strong> — cửa hàng, xưởng nhỏ, điểm thu mua.</li>
</ul>
<h2>Dịch vụ đi kèm</h2>
<p>Giao hàng và lắp đặt tận nơi trong nội thành Quy Nhơn. Bảo hành 12 tháng, hỗ trợ kiểm định và hiệu chuẩn theo yêu cầu.</p>
<p>Liên hệ để nhận báo giá chi tiết theo đúng tải trọng và mục đích sử dụng của bạn.</p>`.trim(),
  },
  {
    title: 'Bán cảm biến lực Loadcell giá rẻ giao hàng tận nơi',
    excerpt:
      'Cảm biến lực (loadcell) thay thế cho cân bàn, cân sàn, cân treo. Đủ dải tải trọng, có sẵn hàng.',
    published: true,
    content: `
<p>Loadcell là bộ phận cảm nhận trọng lượng của cân điện tử. Khi cân báo sai số liên tục, nhảy số hoặc không về 0, nguyên nhân thường nằm ở loadcell.</p>
<h2>Các loại loadcell đang có</h2>
<ul>
  <li>Loadcell thanh (bar) — cho cân bàn 30–500kg.</li>
  <li>Loadcell trụ — cho cân sàn 1–30 tấn.</li>
  <li>Loadcell chữ S — cho cân treo.</li>
</ul>
<h2>Lưu ý khi thay thế</h2>
<p>Cần cung cấp đúng <strong>tải trọng</strong>, <strong>kiểu chân đế</strong> và <strong>hãng cân</strong> đang dùng để chọn loadcell tương thích. Gửi ảnh chụp tem loadcell cũ là cách nhanh nhất.</p>`.trim(),
  },
  {
    title: 'Dịch vụ sửa chữa và hiệu chuẩn cân điện tử',
    excerpt:
      'Sửa chữa cân điện tử mọi hãng, hiệu chuẩn và hỗ trợ kiểm định. Nhận sửa tại xưởng hoặc tới tận nơi.',
    published: true,
    content: `
<p>Nhận sửa chữa cân điện tử các hãng, xử lý những lỗi thường gặp:</p>
<ul>
  <li>Cân không lên nguồn, chập chờn.</li>
  <li>Số nhảy liên tục, không đứng số.</li>
  <li>Cân sai số, cân nhẹ hơn hoặc nặng hơn thực tế.</li>
  <li>Hỏng loadcell do quá tải hoặc vào nước.</li>
</ul>
<h2>Quy trình</h2>
<ol>
  <li>Gọi hotline mô tả tình trạng, kỹ thuật tư vấn sơ bộ.</li>
  <li>Khảo sát tại chỗ hoặc nhận cân về xưởng.</li>
  <li>Báo giá trước khi sửa, đồng ý mới tiến hành.</li>
  <li>Bàn giao kèm hiệu chuẩn lại bằng quả chuẩn.</li>
</ol>`.trim(),
  },
  {
    title: 'Hướng dẫn chọn cân sàn theo tải trọng',
    excerpt:
      'Chọn sai tải trọng khiến cân nhanh hỏng hoặc cân không chính xác. Bài viết hướng dẫn cách chọn đúng.',
    published: false, // để một bản nháp cho dễ thử bộ lọc
    content: `
<p>Nguyên tắc chung: <strong>tải trọng tối đa của cân nên cao hơn khối lượng hàng nặng nhất khoảng 20–30%</strong>.</p>
<h2>Vì sao không nên chọn sát mức</h2>
<p>Cân thường xuyên làm việc ở gần mức tối đa sẽ làm loadcell bị mỏi, dẫn tới sai số tăng dần và giảm tuổi thọ.</p>
<h2>Vì sao không nên chọn quá dư</h2>
<p>Cân tải lớn có bước nhảy lớn. Dùng cân 5 tấn (bước nhảy 1kg) để cân hàng 50kg thì sai số tương đối rất cao.</p>`.trim(),
  },
];

if (process.argv.includes('--clear')) {
  const r = await prisma.page.deleteMany({ where: { title: { startsWith: MARK } } });
  console.log(`✓ Đã xoá ${r.count} trang mẫu.`);
  console.log(`  Còn lại ${await prisma.page.count()} trang trong hệ thống.`);
  await prisma.$disconnect();
  process.exit(0);
}

const existing = await prisma.page.count({ where: { title: { startsWith: MARK } } });
if (existing > 0) {
  console.log(`Đã có sẵn ${existing} trang mẫu — bỏ qua để không tạo trùng.`);
  console.log('Muốn tạo lại: node scripts/seed-pages.mjs --clear rồi chạy lại.');
  await prisma.$disconnect();
  process.exit(0);
}

for (let i = 0; i < SAMPLES.length; i++) {
  const s = SAMPLES[i];
  const title = `${MARK} ${s.title}`;
  await prisma.page.create({
    data: {
      title,
      slug: slugify(s.title),
      content: s.content,
      excerpt: s.excerpt,
      published: s.published,
      createdAt: new Date(Date.now() - i * 3600 * 1000),
    },
  });
  console.log(`  + ${s.title}  (${s.published ? 'đã đăng' : 'nháp'})  →  /trang/${slugify(s.title)}`);
}

console.log(`\n✓ Đã thêm ${SAMPLES.length} trang mẫu.`);
console.log('  Xem tại:  /admin/pages  và  /trang');
console.log('  Xoá đi:   node scripts/seed-pages.mjs --clear');

await prisma.$disconnect();
