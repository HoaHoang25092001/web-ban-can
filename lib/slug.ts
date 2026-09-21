/**
 * Chuyển tiêu đề tiếng Việt thành đường dẫn thân thiện.
 *
 *   "Bán cân điện tử giá rẻ ở tại Quy Nhơn"
 *   → "ban-can-dien-tu-gia-re-o-tai-quy-nhon"
 *
 * Google đọc được từ khoá trong đường dẫn, và khách nhìn link là đoán được nội
 * dung — hơn hẳn "/page/1625" (tiêu chí 4 & 9).
 */

/**
 * Bỏ dấu tiếng Việt.
 *
 * NFD tách "ế" thành "e" + dấu sắc + dấu mũ, rồi xoá các ký tự dấu (U+0300–
 * U+036F). Riêng chữ Đ/đ KHÔNG phải là "D + dấu" trong Unicode mà là một ký tự
 * độc lập, nên NFD không đụng tới — phải thay tay, nếu quên thì "điện tử" ra
 * "in-t" (mất luôn chữ đ) thay vì "dien-tu".
 */
export function removeVietnameseTones(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Độ dài tối đa của slug: đủ chứa từ khoá mà không thành đường dẫn lê thê. */
const MAX_SLUG_LENGTH = 120;

/**
 * Tạo slug từ một chuỗi bất kỳ. Luôn trả về chuỗi hợp lệ, không rỗng.
 */
export function slugify(input: string): string {
  const base = removeVietnameseTones(input)
    .toLowerCase()
    .trim()
    // Mọi thứ không phải chữ/số đều thành gạch ngang: khoảng trắng, dấu câu,
    // ký tự đặc biệt như "(Loadcell)" hay "&".
    .replace(/[^a-z0-9]+/g, '-')
    // Gộp gạch ngang liên tiếp và bỏ gạch ở hai đầu.
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    // Cắt theo độ dài có thể để lại gạch ngang ở cuối.
    .replace(/-$/, '');

  /*
   * Tiêu đề toàn ký tự đặc biệt (ví dụ "###" hay chữ Nhật) sẽ cho chuỗi rỗng.
   * Slug rỗng khiến đường dẫn thành "/trang/" — trùng với trang danh sách và
   * ghi đè lẫn nhau vì cột slug là unique. Dùng mốc thời gian làm dự phòng.
   */
  return base || `trang-${Date.now()}`;
}

/**
 * Tạo slug chưa bị trùng.
 *
 * `isTaken` do nơi gọi cung cấp (thường là truy vấn database). Nếu "quy-nhon"
 * đã có thì thử "quy-nhon-2", "quy-nhon-3"... Không để người dùng tự xử lý lỗi
 * trùng đường dẫn — họ không nhìn thấy các trang khác để mà tránh (tiêu chí 8).
 */
export async function uniqueSlug(
  input: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(input);
  if (!(await isTaken(base))) return base;

  // Giới hạn vòng lặp để một lỗi truy vấn không làm treo tiến trình.
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Date.now()}`;
}
