/**
 * Tạo 3 bài viết mở đầu cho mục Tin tức.
 *
 *   node scripts/seed-news.mjs          → thêm bài
 *   node scripts/seed-news.mjs --clear  → xoá các bài này
 *
 * Nội dung viết từ kiến thức ngành cân và thông tin thật của công ty (kiểm
 * định, bảo hành 12 tháng, địa chỉ, hotline). KHÔNG bịa số liệu, không bịa
 * tên khách hàng, không hứa điều công ty chưa xác nhận.
 *
 * Ba bài này chỉ để mục Tin tức không trống khi khai trương. Bạn nên tự viết
 * thêm bài từ kinh nghiệm tư vấn thật — Google đánh giá cao nội dung gốc hơn
 * nhiều so với bài chung chung.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const HOTLINE = '0369.759.187';

const ARTICLES = [
  {
    title: 'Cân điện tử bao lâu phải kiểm định lại một lần?',
    excerpt:
      'Kiểm định là yêu cầu bắt buộc với cân dùng trong mua bán. Bài viết giải thích chu kỳ kiểm định, dấu hiệu cân cần kiểm định lại và những gì cần chuẩn bị.',
    content: `<p>Cân điện tử dùng trong mua bán, thanh toán hoặc giao nhận hàng hoá đều thuộc nhóm phương tiện đo bắt buộc phải kiểm định theo quy định về đo lường. Đây không phải thủ tục hình thức: cân sai số gây thiệt hại cho cả người bán lẫn người mua, và có thể bị xử phạt khi cơ quan quản lý kiểm tra.</p>

<h2>Chu kỳ kiểm định</h2>
<p>Thông thường cân điện tử được kiểm định định kỳ <strong>12 tháng một lần</strong>. Tem kiểm định dán trên thân cân ghi rõ thời hạn hiệu lực, bạn có thể kiểm tra trực tiếp trên tem.</p>
<p>Ngoài chu kỳ định kỳ, cân cần kiểm định lại trong các trường hợp sau:</p>
<ul>
<li>Sau khi sửa chữa, thay loadcell hoặc thay bo mạch</li>
<li>Khi tem kiểm định bị rách, mờ hoặc bong ra</li>
<li>Khi nghi ngờ cân cho kết quả sai lệch</li>
<li>Khi di chuyển cân sàn, cân xe tải sang vị trí lắp đặt mới</li>
</ul>

<h2>Dấu hiệu cân cần kiểm tra lại</h2>
<ul>
<li>Cùng một vật nhưng cân nhiều lần ra số khác nhau</li>
<li>Số hiển thị nhảy liên tục, không đứng yên</li>
<li>Không về 0 sau khi lấy vật ra khỏi bàn cân</li>
<li>Đặt vật ở các vị trí khác nhau trên bàn cân cho kết quả lệch nhau</li>
</ul>
<p>Nếu gặp các dấu hiệu này, nên ngừng dùng cân cho việc mua bán và liên hệ kiểm tra. Tiếp tục sử dụng có thể dẫn tới tranh chấp với khách hàng.</p>

<h2>Cần chuẩn bị gì khi kiểm định</h2>
<p>Cân phải ở trạng thái hoạt động bình thường, bàn cân sạch và đặt trên mặt phẳng vững. Với cân sàn và cân xe tải, kỹ thuật viên thường kiểm định ngay tại chỗ vì việc tháo lắp phức tạp.</p>

<h2>Hỗ trợ từ Cân Vạn Thịnh Phát</h2>
<p>Toàn bộ cân do chúng tôi cung cấp đều có tem kiểm định khi giao và được bảo hành 12 tháng. Khi đến hạn kiểm định lại hoặc cân có dấu hiệu sai số, bạn gọi <strong>${HOTLINE}</strong> để được hướng dẫn.</p>`,
  },
  {
    title: 'Chọn cân bàn bao nhiêu kg cho cửa hàng và kho nhỏ?',
    excerpt:
      'Chọn mức cân quá nhỏ thì cân nhanh hỏng, quá lớn thì đọc số không chính xác với hàng nhẹ. Hướng dẫn chọn đúng mức cân theo loại hàng thực tế.',
    content: `<p>Câu hỏi khách hỏi nhiều nhất khi mua cân bàn là "nên lấy loại bao nhiêu kg". Chọn sai gây phiền toái lâu dài: cân quá nhỏ so với hàng thì nhanh hỏng loadcell, còn cân quá lớn thì bước nhảy thô, cân hàng nhẹ không đọc được chính xác.</p>

<h2>Nguyên tắc chung</h2>
<p>Chọn mức cân sao cho <strong>vật nặng nhất bạn thường cân nằm trong khoảng 30–70% mức cân tối đa</strong>. Ví dụ hàng nặng nhất khoảng 60kg thì chọn cân 100kg là hợp lý, không nên chọn cân 60kg vì luôn chạm ngưỡng tối đa.</p>

<h2>Gợi ý theo loại hình kinh doanh</h2>
<ul>
<li><strong>Cửa hàng tạp hoá, rau củ:</strong> cân tính tiền 30kg là đủ, có sẵn chức năng tính tiền theo đơn giá</li>
<li><strong>Cửa hàng thuỷ hải sản:</strong> cân chống nước 30–60kg, ưu tiên loại thân inox chống ăn mòn</li>
<li><strong>Kho hàng nhỏ, đóng gói:</strong> cân bàn 100–150kg</li>
<li><strong>Xưởng sản xuất, kho vừa:</strong> cân bàn 200–300kg hoặc cân sàn từ 500kg</li>
<li><strong>Cân bao, cân pallet:</strong> cân sàn 1–3 tấn</li>
</ul>

<h2>Lưu ý về bước nhảy</h2>
<p>Bước nhảy là mức thay đổi nhỏ nhất mà cân đọc được. Cân 100kg thường có bước nhảy 20g, cân 300kg là 50g, cân 1 tấn là 200g. Nếu hàng của bạn cần đọc chính xác tới từng chục gram thì không nên chọn cân mức quá lớn.</p>

<h2>Môi trường sử dụng</h2>
<p>Nơi ẩm ướt, nhiều nước hoặc bụi nên chọn loại chống nước, thân inox. Cân thường dùng trong môi trường ẩm sẽ hỏng bo mạch rất nhanh, và hỏng do nước thường không thuộc phạm vi bảo hành.</p>

<h2>Cần tư vấn cụ thể</h2>
<p>Mỗi ngành hàng có yêu cầu khác nhau. Bạn gọi <strong>${HOTLINE}</strong> mô tả loại hàng và nơi đặt cân, chúng tôi tư vấn loại phù hợp và báo giá trong giờ làm việc.</p>`,
  },
  {
    title: 'Cân điện tử báo sai số: nguyên nhân và cách xử lý',
    excerpt:
      'Phần lớn trường hợp cân sai số đến từ nguyên nhân đơn giản có thể tự khắc phục. Bài viết liệt kê các lỗi thường gặp và khi nào cần gọi kỹ thuật.',
    content: `<p>Cân đang dùng bình thường bỗng cho kết quả sai là tình huống hay gặp. Trước khi nghĩ tới việc sửa chữa, nên kiểm tra vài nguyên nhân đơn giản — phần lớn trường hợp xử lý được ngay tại chỗ.</p>

<h2>Kiểm tra trước tiên</h2>
<ul>
<li><strong>Mặt sàn đặt cân:</strong> cân phải đặt trên mặt phẳng cứng và vững. Đặt trên nền nghiêng, nền gạch vỡ hoặc sàn gỗ rung đều gây sai số</li>
<li><strong>Chân cân:</strong> bốn chân phải tiếp đất đều. Nếu cân bập bênh, vặn điều chỉnh chân cho cân bằng</li>
<li><strong>Vật lạ dưới bàn cân:</strong> mẩu giấy, hạt sạn kẹt giữa bàn cân và khung là nguyên nhân rất phổ biến</li>
<li><strong>Về 0 trước khi cân:</strong> bấm nút ZERO khi bàn cân đang trống</li>
</ul>

<h2>Các nguyên nhân khác</h2>
<ul>
<li><strong>Nguồn điện không ổn định:</strong> dùng chung ổ cắm với thiết bị công suất lớn có thể gây nhiễu. Thử cắm sang ổ khác</li>
<li><strong>Pin yếu:</strong> cân chạy pin khi gần hết thường hiển thị sai trước khi tắt hẳn</li>
<li><strong>Nhiệt độ thay đổi đột ngột:</strong> chuyển cân từ nơi lạnh sang nơi nóng cần để ổn định 15–30 phút</li>
<li><strong>Đặt gần thiết bị phát sóng mạnh:</strong> motor, máy hàn, biến tần có thể gây nhiễu tín hiệu</li>
</ul>

<h2>Khi nào cần gọi kỹ thuật</h2>
<p>Nếu đã kiểm tra hết các điểm trên mà cân vẫn sai, khả năng cao là loadcell hoặc bo mạch có vấn đề. Các dấu hiệu:</p>
<ul>
<li>Số nhảy liên tục không đứng yên dù bàn cân trống</li>
<li>Đặt vật ở bốn góc bàn cân cho bốn kết quả chênh lệch nhiều</li>
<li>Cân không lên số hoặc báo lỗi trên màn hình</li>
<li>Cân từng bị quá tải nặng hoặc rơi va đập</li>
</ul>
<p><strong>Không nên tự tháo cân để sửa.</strong> Loadcell là bộ phận nhạy, tháo sai cách có thể làm hỏng vĩnh viễn, và việc tự tháo thường làm mất hiệu lực bảo hành.</p>

<h2>Hỗ trợ kỹ thuật</h2>
<p>Cân mua tại Cân Vạn Thịnh Phát được bảo hành 12 tháng. Khi cân có dấu hiệu bất thường, gọi <strong>${HOTLINE}</strong> để được hướng dẫn kiểm tra, hoặc mang cân tới cửa hàng tại 605 Quốc lộ 13, Phường Hiệp Bình, TP. Hồ Chí Minh.</p>`,
  },
];

if (process.argv.includes('--clear')) {
  const titles = ARTICLES.map((a) => a.title);
  const r = await prisma.news.deleteMany({ where: { title: { in: titles } } });
  console.log(`✓ Đã xoá ${r.count} bài.`);
  await prisma.$disconnect();
  process.exit(0);
}

const existing = await prisma.news.count({
  where: { title: { in: ARTICLES.map((a) => a.title) } },
});
if (existing > 0) {
  console.log(`Đã có ${existing} bài trong số này — bỏ qua để không tạo trùng.`);
  await prisma.$disconnect();
  process.exit(0);
}

// Gán ảnh minh hoạ lấy từ sản phẩm còn lại (ảnh thật của công ty).
const withImage = await prisma.product.findMany({
  where: { NOT: { image: null } },
  select: { image: true },
  take: ARTICLES.length,
});

for (let i = 0; i < ARTICLES.length; i++) {
  const a = ARTICLES[i];
  await prisma.news.create({
    data: {
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      image: withImage[i]?.image ?? null,
      published: true,
      // Giãn ngày đăng để mục tin tức không hiện 3 bài cùng một thời điểm.
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`  + ${a.title}`);
}

console.log(`\n✓ Đã thêm ${ARTICLES.length} bài viết.`);
console.log('  Xem tại: /news');
console.log('  Xoá đi:  node scripts/seed-news.mjs --clear');

await prisma.$disconnect();
