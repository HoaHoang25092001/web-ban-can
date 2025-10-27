'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Quill: any;
  }
}

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  height?: number;
}

export default function RichTextEditorStable({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  height = 400
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '👍', '👎', '👌', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✌️',
    '🤞', '💪', '💯', '🔥', '⚡', '💥', '💫', '⭐', '🌟', '✨',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
  ];

  const insertEmoji = useCallback((emoji: string) => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection() || { index: 0 };
      quillRef.current.insertText(range.index, emoji);
      quillRef.current.setSelection(range.index + emoji.length);
    }
    setShowEmojiPicker(false);
  }, []);

  // Initialize Quill only once
  useEffect(() => {
    if (isInitializingRef.current || quillRef.current) return;
    
    isInitializingRef.current = true;

    const initializeEditor = async () => {
      try {
        // Wait for container to be ready
        if (!containerRef.current) {
          isInitializingRef.current = false;
          return;
        }

        // Check if Quill is already initialized on this container
        if (containerRef.current.querySelector('.ql-editor')) {
          isInitializingRef.current = false;
          return;
        }

        // Load Quill if not already loaded
        if (!window.Quill) {
          // Load CSS
          if (!document.querySelector('link[href*="quill.snow.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
            document.head.appendChild(link);
          }

          // Load JS
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Double check container is still available and not already initialized
        if (!containerRef.current || containerRef.current.querySelector('.ql-editor')) {
          isInitializingRef.current = false;
          return;
        }

        // Clear any existing content in container
        containerRef.current.innerHTML = '';

        // Initialize Quill
        const quill = new window.Quill(containerRef.current, {
          theme: 'snow',
          placeholder: placeholder,
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean']
            ]
          }
        });

        // Set initial content without triggering change
        if (value) {
          quill.clipboard.dangerouslyPasteHTML(value);
        }

        // Listen for changes
        quill.on('text-change', (_delta: any, _oldDelta: any, source: any) => {
          if (source === 'user') {
            onChange(quill.root.innerHTML);
          }
        });

        quillRef.current = quill;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Quill:', error);
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeEditor();

    // Cleanup
    return () => {
      if (quillRef.current) {
        try {
          quillRef.current.off('text-change');
          quillRef.current = null;
        } catch (error) {
          console.error('Error cleaning up Quill:', error);
        }
      }
      isInitializingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - initialize only once

  // Update content when value changes externally (but not from user input)
  useEffect(() => {
    if (quillRef.current && isReady) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value && value !== undefined) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value, isReady]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {/* Editor Container */}
        <div 
          ref={containerRef}
          style={{ minHeight: height }}
          className="w-full border border-gray-300 rounded-md"
        />
        
        {/* Floating Emoji Button */}
        {isReady && (
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 py-1 text-sm bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors shadow-sm"
              title="Thêm emoji"
            >
              😀
            </button>
            
            {showEmojiPicker && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 grid grid-cols-8 gap-1 w-72 z-20">
                <div className="col-span-8 text-xs text-gray-500 mb-2 border-b pb-2">
                  Click vào emoji để thêm vào văn bản
                </div>
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="col-span-8 mt-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {!isReady && (
        <div className="flex items-center justify-center p-8 bg-gray-50 border border-gray-300 rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">Đang khởi tạo editor...</span>
        </div>
      )}
    </div>
  );
}