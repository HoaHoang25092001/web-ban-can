'use client';

interface RichContentDisplayProps {
  content: string;
  className?: string;
}

export default function RichContentDisplay({ content, className = '' }: RichContentDisplayProps) {
  // Process content for better formatting
  const processContent = (htmlContent: string) => {
    return htmlContent
      // Remove empty paragraphs
      .replace(/<p><br><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  const processedContent = processContent(content);

  return (
    <div 
      className={`
        text-gray-700 leading-relaxed
        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-4 [&>h1]:mt-6
        [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mb-3 [&>h2]:mt-5
        [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>h3]:mt-4
        [&>p]:mb-4 [&>p]:leading-7 [&>p]:text-gray-700
        [&>strong]:font-semibold [&>strong]:text-gray-900
        [&>em]:italic [&>em]:text-gray-600
        [&>ul]:mb-4 [&>ul]:ml-6 [&>ul]:list-disc [&>ul]:space-y-2
        [&>ol]:mb-4 [&>ol]:ml-6 [&>ol]:list-decimal [&>ol]:space-y-2
        [&>li]:leading-6 [&>li]:text-gray-700
        [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:bg-blue-50 [&>blockquote]:p-4 [&>blockquote]:my-4 [&>blockquote]:italic [&>blockquote]:text-gray-600
        [&>a]:text-blue-600 [&>a]:no-underline hover:[&>a]:underline
        [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:shadow-md [&>img]:mx-auto [&>img]:my-4
        [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
        ${className}
      `}
      style={{
        fontSize: '16px',
        lineHeight: '1.7'
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}