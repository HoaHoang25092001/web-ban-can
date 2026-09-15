'use client';

import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing-client';
import { X, Loader2, UploadCloud } from 'lucide-react';

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
      alert(`Upload thất bại: ${error.message}`);
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ hỗ trợ định dạng: JPG, PNG, WebP, GIF');
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        alert('Kích thước file tối đa là 4MB');
        return;
      }

      setIsUploading(true);
      await startUpload([file]);
    },
    [startUpload]
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
    </div>
  );
}
