'use client';

import { useRef, useState } from 'react';

interface SimpleRichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  height?: number;
}

export default function SimpleRichTextEditor({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  height = 400
}: SimpleRichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showFormatting, setShowFormatting] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const formatButtons = [
    { label: 'B', action: () => insertText('**', '**'), title: 'Bold' },
    { label: 'I', action: () => insertText('*', '*'), title: 'Italic' },
    { label: 'H1', action: () => insertText('# '), title: 'Heading 1' },
    { label: 'H2', action: () => insertText('## '), title: 'Heading 2' },
    { label: 'Link', action: () => insertText('[', '](url)'), title: 'Link' },
    { label: '•', action: () => insertText('- '), title: 'List' },
  ];

  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '👍', '👎', '👌', '🤝', '👏', '🙌', '💪', '💯', '🔥', '⚡',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  ];

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowFormatting(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Simple Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded-t-md">
        {formatButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors font-mono"
          >
            {btn.label}
          </button>
        ))}
        
        <button
          type="button"
          onClick={() => setShowFormatting(!showFormatting)}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          😀
        </button>
        
        {showFormatting && (
          <div className="absolute z-10 mt-8 bg-white border border-gray-300 rounded-md shadow-lg p-2 grid grid-cols-10 gap-1">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="p-1 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="border border-gray-300 border-t-0 rounded-b-md overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{ minHeight: height }}
          className="w-full p-3 border-0 focus:outline-none focus:ring-0 resize-none"
        />
      </div>
      
      <div className="text-xs text-gray-500">
        Sử dụng Markdown syntax: **bold**, *italic*, # heading
      </div>
    </div>
  );
}