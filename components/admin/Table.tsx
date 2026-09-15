interface TableProps {
  headers: string[];
  children: React.ReactNode;
  /** Mô tả bảng cho screen reader, ví dụ "Danh sách sản phẩm". */
  caption?: string;
}

/**
 * Bảng dữ liệu trang quản trị.
 *
 * Bản trước dùng `overflow-hidden` ở khung ngoài: trên màn hình hẹp, các cột
 * bên phải bị cắt và KHÔNG thể cuộn tới. Nay dùng `overflow-x-auto` để bảng tự
 * cuộn ngang trong khung riêng, không làm cả trang bị cuộn ngang (tiêu chí 6).
 */
export function Table({ headers, children, caption }: TableProps) {
  return (
    <div className="relative">
    <div
      tabIndex={0}
      role="region"
      aria-label={caption ? `${caption} (cuộn ngang để xem đủ cột)` : 'Bảng dữ liệu, cuộn ngang để xem đủ cột'}
      className="overflow-x-auto rounded-lg border border-gray-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <table className="min-w-full divide-y divide-gray-200">
        {caption && <caption className="sr-only-text">{caption}</caption>}
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                /* scope="col" cho screen reader biết đây là tiêu đề của cột */
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
    {/* Gợi ý còn nội dung bên phải, chỉ hiện trên màn hình hẹp. */}
    <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-lg bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="hover:bg-gray-50 transition-colors">{children}</tr>;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 sm:px-6 py-4 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}
