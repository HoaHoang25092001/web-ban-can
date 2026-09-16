'use client';

import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing-client';
import { X, Loader2, UploadCloud , ImagePlus } from 'lucide-react';
import { useToast } from '@/components/Toast';
import MediaLibraryPicker from './MediaLibraryPicker';

interface UploadThingUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string; // kept for API compatibility
}

export default function UploadThingUpload({
  label,
  value,
  onChange,
}: UploadThingUploadProps) {
  const toast = useToast();
  const [showLibrary, setShowLibrary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        // v7: dùng ufsUrl (UploadThing File Storage URL)
        onChange(res[0].ufsUrl);
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast.error('Tải ảnh thất bại', error.message);
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('File không phải ảnh', `"${file.name}" không dùng được. Chỉ nhận JPG, PNG, WebP, GIF.`);
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        toast.error('Ảnh vượt quá 4MB', `"${file.name}" nặng ${(file.size / 1024 / 1024).toFixed(1)}MB. Hãy giảm dung lượng rồi tải lại.`);
        return;
      }

      setIsUploading(true);
      await startUpload([file]);
    },
    [startUpload, toast]
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-32 h-32 object-cover border border-gray-300 rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate max-w-xs">{value}</p>
        </div>
      ) : (
        <label
          htmlFor={`upload-${label}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
        >
          <input
            id={`upload-${label}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleInputChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <UploadCloud className="h-10 w-10 mb-2 text-gray-500" />
              <p className="text-sm font-medium mb-1">
                Kéo thả hoặc <span className="text-blue-600">click để chọn ảnh</span>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF — tối đa 4MB</p>
            </div>
          )}
        </label>
      )}

      {/* Hai cách thêm ảnh đặt cạnh nhau (tiêu chí 1). */}
      {!value && (
        <div className="flex flex-col sm:flex-row gap-2">
          <label
            htmlFor={`upload-${label}`}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Tải lên từ tệp
          </label>
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Chọn từ thư viện
          </button>
        </div>
      )}

      <MediaLibraryPicker
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={(urls) => {
          if (urls[0]) {
            onChange(urls[0]);
            toast.success('Đã chọn ảnh từ thư viện');
          }
        }}
        maxSelect={1}
      />
    </div>
  );
}
