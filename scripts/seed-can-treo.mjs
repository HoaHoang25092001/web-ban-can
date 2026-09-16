/**
 * Tạo 10 sản phẩm cân treo điện tử MẪU để thử giao diện.
 *
 *   node scripts/seed-can-treo.mjs          → thêm dữ liệu
 *   node scripts/seed-can-treo.mjs --clear  → xoá sạch dữ liệu mẫu
 *
 * Tên sản phẩm đều có tiền tố "[MẪU]" để không nhầm với hàng thật và xoá đi
 * dễ dàng. Thông số (mức cân, bước nhảy, hãng) lấy theo model có thật trên
 * thị trường để giao diện hiển thị sát thực tế — nhưng đây KHÔNG phải hàng
 * công ty đang bán, đừng để lẫn khi chạy thật.
 *
 * Ảnh dùng lại ảnh cân treo sẵn có trong kho, không tải thêm gì.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CATEGORY_ID = 17; // Cân treo điện tử
const MARK = '[MẪU]';

const SAMPLES = [
  {
    name: 'Cân treo điện tử OCS-S 1 tấn',
    capacity: '1tấn', accuracy: '0.5kg', manufacturer: 'OCS', origin: 'Trung Quốc',
    description: 'Cân treo điện tử OCS-S tải trọng 1 tấn, bước nhảy 0,5kg. Vỏ hợp kim nhôm đúc, màn hình LED đỏ 5 số hiển thị rõ dưới ánh nắng. Kèm móc treo và remote điều khiển từ xa.',
  },
  {
    name: 'Cân treo điện tử OCS-S 2 tấn',
    capacity: '2tấn', accuracy: '1kg', manufacturer: 'OCS', origin: 'Trung Quốc',
    description: 'Cân treo điện tử OCS-S tải trọng 2 tấn, bước nhảy 1kg. Pin sạc dùng liên tục 60 giờ, tự động tắt khi không sử dụng để tiết kiệm điện.',
  },
  {
    name: 'Cân treo điện tử CAS Caston-I 3 tấn',
    capacity: '3tấn', accuracy: '1kg', manufacturer: 'CAS', origin: 'Hàn Quốc',
    description: 'Cân treo CAS Caston-I nhập khẩu Hàn Quốc, tải trọng 3 tấn. Cảm biến loadcell hợp kim chịu tải cao, độ bền tốt trong môi trường nhà xưởng.',
  },
  {
    name: 'Cân treo điện tử VIBRA TTS 5 tấn',
    capacity: '5tấn', accuracy: '2kg', manufacturer: 'VIBRA', origin: 'Nhật Bản',
    description: 'Cân treo VIBRA TTS nhập khẩu Nhật Bản, tải trọng 5 tấn. Độ chính xác cao, phù hợp cân hàng hoá giá trị lớn tại cảng và kho bãi.',
  },
  {
    name: 'Cân treo điện tử JJE 10 tấn',
    capacity: '10tấn', accuracy: '5kg', manufacturer: 'JJE', origin: 'Trung Quốc',
    description: 'Cân treo điện tử JJE tải trọng 10 tấn dùng cho cẩu trục nhà máy thép, bến cảng. Khung thép chịu lực, móc cẩu xoay 360 độ.',
  },
  {
    name: 'Cân treo điện tử mini 300kg',
    capacity: '300kg', accuracy: '100g', manufacturer: 'OCS', origin: 'Trung Quốc',
    description: 'Cân treo mini 300kg gọn nhẹ, cầm tay thuận tiện. Phù hợp cân nông sản, thuỷ sản tại chợ đầu mối và điểm thu mua.',
  },
  {
    name: 'Cân treo điện tử chống nước 500kg',
    capacity: '500kg', accuracy: '200g', manufacturer: 'OCS', origin: 'Trung Quốc',
    description: 'Cân treo chống nước tiêu chuẩn IP65, tải trọng 500kg. Dùng được trong môi trường ẩm ướt như kho lạnh, xưởng chế biến thuỷ sản.',
  },
  {
    name: 'Cân treo điện tử in tem 1 tấn',
    capacity: '1tấn', accuracy: '0.5kg', manufacturer: 'CAS', origin: 'Hàn Quốc',
    description: 'Cân treo tích hợp máy in tem nhãn, tải trọng 1 tấn. In trực tiếp khối lượng và mã hàng, tiện cho kho vận và đóng gói xuất khẩu.',
  },
  {
    name: 'Cân treo điện tử có remote 2 tấn',
    capacity: '2tấn', accuracy: '1kg', manufacturer: 'JJE', origin: 'Trung Quốc',
    description: 'Cân treo 2 tấn kèm điều khiển từ xa trong bán kính 30m. Thao tác trừ bì, về 0 và giữ số ngay dưới đất, không cần trèo lên cao.',
  },
  {
    name: 'Cân treo điện tử inox 1 tấn',
    capacity: '1tấn', accuracy: '0.5kg', manufacturer: 'VIBRA', origin: 'Nhật Bản',
    description: 'Cân treo vỏ inox 304 chống ăn mòn, tải trọng 1 tấn. Dùng cho ngành thực phẩm, hoá chất và môi trường có hơi muối.',
  },
];

if (process.argv.includes('--clear')) {
  const r = await prisma.product.deleteMany({
    where: { name: { startsWith: MARK } },
  });
  console.log(`✓ Đã xoá ${r.count} sản phẩm mẫu.`);
  console.log(`  Còn lại ${await prisma.product.count()} sản phẩm trong hệ thống.`);
  await prisma.$disconnect();
  process.exit(0);
}

// Không tạo trùng nếu chạy lại nhiều lần.
const existing = await prisma.product.count({ where: { name: { startsWith: MARK } } });
if (existing > 0) {
  console.log(`Đã có sẵn ${existing} sản phẩm mẫu — bỏ qua để không tạo trùng.`);
  console.log('Muốn tạo lại: node scripts/seed-can-treo.mjs --clear rồi chạy lại.');
  await prisma.$disconnect();
  process.exit(0);
}

const category = await prisma.category.findUnique({ where: { id: CATEGORY_ID } });
if (!category) {
  console.error(`Không tìm thấy danh mục id=${CATEGORY_ID}.`);
  await prisma.$disconnect();
  process.exit(1);
}

/*
 * Lấy ảnh từ chính các sản phẩm cân treo sẵn có: ảnh thật của công ty, đúng
 * loại hàng. Không tải thêm ảnh mới để khỏi phình dung lượng lưu trữ.
 */
const withImage = await prisma.product.findMany({
  where: { categoryId: CATEGORY_ID, NOT: { image: null }, name: { not: { startsWith: MARK } } },
  select: { image: true, images: true },
});

if (withImage.length === 0) {
  console.error('Danh mục chưa có sản phẩm nào kèm ảnh để dùng lại.');
  await prisma.$disconnect();
  process.exit(1);
}

for (let i = 0; i < SAMPLES.length; i++) {
  const s = SAMPLES[i];
  const pic = withImage[i % withImage.length];
  await prisma.product.create({
    data: {
      name: `${MARK} ${s.name}`,
      description: s.description,
      capacity: s.capacity,
      accuracy: s.accuracy,
      manufacturer: s.manufacturer,
      origin: s.origin,
      price: 'Liên hệ',
      image: pic.image,
      images: pic.images ?? [],
      categoryId: CATEGORY_ID,
      featured: false,
      // Giãn ngày tạo để danh sách không xếp cùng một thời điểm.
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000),
    },
  });
  console.log(`  + ${s.name}  (${s.capacity} · ${s.manufacturer})`);
}

const total = await prisma.product.count({ where: { categoryId: CATEGORY_ID } });
console.log(`\n✓ Đã thêm ${SAMPLES.length} sản phẩm mẫu.`);
console.log(`  Danh mục "${category.name}" hiện có ${total} sản phẩm.`);
console.log('  Xem tại: /category/17');
console.log('  Xoá đi:  node scripts/seed-can-treo.mjs --clear');

await prisma.$disconnect();
