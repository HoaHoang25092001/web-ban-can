'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
  Palette,
  X,
} from 'lucide-react';

interface TiptapEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  height?: number;
}

/**
 * Nút trên thanh công cụ.
 *
 * Định nghĩa Ở NGOÀI component cha: bản trước khai báo bên trong nên mỗi lần gõ
 * một ký tự, React coi đây là một loại component mới và tháo/dựng lại toàn bộ
 * ~25 nút — vừa tốn tài nguyên vừa làm mất focus.
 *
 * Vùng chạm 40px (thanh công cụ dày đặc nên không ép đủ 44px, nhưng vẫn lớn hơn
 * mức 32px trước đây) và có trạng thái aria-pressed cho screen reader.
 */
function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  required = false,
  height = 400,
}: TiptapEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  /**
   * Đóng bảng emoji / bảng màu khi nhấn Esc hoặc bấm ra ngoài (tiêu chí 5).
   * Trước đây chỉ đóng được bằng nút "Đóng" bên trong bảng, nên bảng cứ mở lơ
   * lửng che mất nội dung đang soạn.
   */
  useEffect(() => {
    if (!showEmojiPicker && !showColorPicker) return;

    const closeAll = () => {
      setShowEmojiPicker(false);
      setShowColorPicker(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    const onPointerDown = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [showEmojiPicker, showColorPicker]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none p-4',
        style: `min-height: ${height}px; max-height: ${height * 1.5}px; overflow-y: auto;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '👍', '👎', '👌', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✌️',
    '🤞', '💪', '💯', '🔥', '⚡', '💥', '💫', '⭐', '🌟', '✨',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  ];

  const textColors = [
    { name: 'Đen', color: '#000000' },
    { name: 'Xám đậm', color: '#374151' },
    { name: 'Xám', color: '#6B7280' },
    { name: 'Đỏ', color: '#EF4444' },
    { name: 'Cam', color: '#F97316' },
    { name: 'Vàng', color: '#EAB308' },
    { name: 'Xanh lá', color: '#22C55E' },
    { name: 'Xanh dương', color: '#3B82F6' },
    { name: 'Xanh da trời', color: '#06B6D4' },
    { name: 'Tím', color: '#A855F7' },
    { name: 'Hồng', color: '#EC4899' },
    { name: 'Trắng', color: '#FFFFFF' },
  ];

  const insertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const setLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center justify-center p-8 bg-gray-50 border border-gray-300 rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">Đang khởi tạo editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/*
        KHÔNG dùng overflow-hidden ở đây: bảng chọn emoji và bảng màu là phần tử
        `absolute` nằm tràn ra ngoài khung editor, nên overflow-hidden của thẻ cha
        sẽ CẮT CỤT chúng — người dùng chỉ thấy vài cột emoji đầu tiên.
        Dùng isolate để tạo stacking context riêng, giữ z-index hoạt động đúng.
      */}
      <div className="border border-gray-300 rounded-lg bg-white isolate">
        {/* Toolbar */}
        <div
          ref={toolbarRef}
          className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg"
        >
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Đậm (Ctrl+B)"
            >
              <Bold size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Nghiêng (Ctrl+I)"
            >
              <Italic size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Gạch giữa"
            >
              <Strikethrough size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Code"
            >
              <Code size={18} />
            </ToolbarButton>
          </div>

          {/* Text Color */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Màu chữ"
              >
                <Palette size={18} />
              </ToolbarButton>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-20 w-64">
                  <div className="text-xs text-gray-500 mb-2 border-b pb-2">
                    Chọn màu chữ
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {textColors.map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setColor(item.color).run();
                          setShowColorPicker(false);
                        }}
                        className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded transition-colors"
                        title={item.name}
                      >
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-200"
                          style={{
                            backgroundColor: item.color,
                            border: item.color === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                          }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                      }}
                      className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Xóa màu
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(false)}
                    className="w-full mt-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={18} />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Danh sách"
            >
              <List size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Danh sách số"
            >
              <ListOrdered size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Trích dẫn"
            >
              <Quote size={18} />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Căn trái"
            >
              <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Căn giữa"
            >
              <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Căn phải"
            >
              <AlignRight size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              active={editor.isActive({ textAlign: 'justify' })}
              title="Căn đều"
            >
              <AlignJustify size={18} />
            </ToolbarButton>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Thêm liên kết">
              <LinkIcon size={18} />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Thêm hình ảnh">
              <ImageIcon size={18} />
            </ToolbarButton>
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Thêm emoji"
              >
                <Smile size={18} />
              </ToolbarButton>
              {showEmojiPicker && (
                <>
                {/* Lớp phủ: làm nổi bảng chọn và cho phép bấm ra ngoài để đóng */}
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setShowEmojiPicker(false)}
                  aria-hidden="true"
                />
                {/* Bảng emoji: 8 cột × 40px + lề = 356px, đủ chỗ cho mọi icon */}
                <div
                  role="dialog"
                  aria-label="Chọn emoji"
                  /*
                    Vị trí bảng emoji phụ thuộc chỗ nút nằm trên thanh công cụ —
                    mà thanh công cụ tự xuống dòng theo bề rộng màn hình, nên nút
                    có thể ở bên phải (mở sang trái thì tràn ra ngoài form) hoặc
                    bên trái (mở sang phải thì bị sidebar che).

                    Dùng `fixed` + căn giữa màn hình để bảng luôn hiện trọn vẹn,
                    không lệ thuộc vị trí nút hay khung cha. Trên mobile cách này
                    cũng dễ thao tác hơn hẳn.
                  */
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[356px] max-w-[calc(100vw-2rem)] bg-white border border-gray-300 rounded-lg shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Chọn emoji</span>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      aria-label="Đóng bảng emoji"
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* 60 emoji × 8 cột = 8 hàng ≈ 330px: hiển thị hết trong một
                      lần nhìn, không cần cuộn. max-h chỉ là chặn an toàn nếu
                      sau này danh sách emoji dài thêm. */}
                  <div className="grid grid-cols-8 gap-1 p-2 max-h-[60vh] overflow-y-auto">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        aria-label={`Chèn emoji ${emoji}`}
                        className="w-10 h-10 flex items-center justify-center text-xl leading-none hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                </>
              )}
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Làm lại (Ctrl+Y)"
            >
              <Redo size={18} />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      <div className="text-xs text-gray-500">
        Sử dụng các nút trên để định dạng văn bản của bạn
      </div>
    </div>
  );
}
