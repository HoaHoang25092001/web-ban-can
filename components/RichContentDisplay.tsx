interface RichContentDisplayProps {
  content: string;
  className?: string;
}

/**
 * Hiển thị nội dung HTML soạn từ trang quản trị (Tiptap).
 *
 * Lưu ý về selector: bản trước dùng `[&>a]`, `[&>strong]`… tức chỉ áp dụng cho
 * con TRỰC TIẾP. Trình soạn thảo luôn bọc chữ trong <p>, nên link và chữ đậm
 * nằm sâu một cấp và không hề nhận được style — link hiện ra như chữ thường,
 * người đọc không biết bấm được. Nay dùng `[&_a]` (mọi cấp con) để style thật
 * sự có tác dụng.
 */
export default function RichContentDisplay({ content, className = '' }: RichContentDisplayProps) {
  const processContent = (htmlContent: string) =>
    htmlContent
      // Bỏ đoạn rỗng do trình soạn thảo sinh ra
      .replace(/<p><br><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      .trim();

  const processedContent = processContent(content);

  return (
    <div
      className={`
        text-base leading-relaxed text-slate-700
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h1]:mt-6
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-6
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-5
        [&_p]:mb-4 [&_p]:leading-7
        [&_strong]:font-semibold [&_strong]:text-slate-900
        [&_em]:italic
        [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1.5
        [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1.5
        [&_li]:leading-7
        [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:bg-brand-50
        [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:my-4 [&_blockquote]:italic
        [&_a]:text-brand-700 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
        [&_a]:decoration-brand-300 hover:[&_a]:decoration-brand-700 [&_a]:break-words
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-card [&_img]:shadow-card
        [&_img]:mx-auto [&_img]:my-5
        [&_code]:bg-surface-sunken [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
        [&_table]:w-full [&_table]:my-4 [&_table]:text-sm
        [&_td]:border [&_td]:border-surface-border [&_td]:px-3 [&_td]:py-2
        [&_th]:border [&_th]:border-surface-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-surface-sunken
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
