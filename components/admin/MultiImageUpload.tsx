'use client';

import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing-client';
import { X, Loader2, UploadCloud, ImagePlus, Star } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface MultiImageUploadProps {
  label?: string;
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({
  label = 'Hình ảnh sản phẩm',
  values,
  onChange,
  maxImages = 10,
}: MultiImageUploadProps) {
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const { startUpload } = useUploadThing('multiImageUploader', {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress('');
      if (res && res.length > 0) {
        const newUrls = res.map((r) => r.ufsUrl);
        const combined = [...values, ...newUrls].slice(0, maxImages);
        onChange(combined);
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress('');
      toast.error('Tải ảnh thất bại', error.message);
    },
    onUploadProgress: (p) => {
      setUploadProgress(`${p}%`);
    },
  });

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const MAX_SIZE = 4 * 1024 * 1024;

      /*
       * Kiểm tra CÒN CHỖ trước tiên. Bản trước để phép kiểm tra này xuống cuối
       * và gộp chung với mọi nguyên nhân khác vào một câu "Đã đạt giới hạn N
       * ảnh" — nên khi khách chọn nhầm file PDF hoặc ảnh quá 4MB lúc chưa có
       * ảnh nào, hệ thống vẫn báo "đã đạt giới hạn 10 ảnh" dù đang là 0/10.
       * Thông báo sai khiến người dùng không biết phải sửa gì (tiêu chí 8).
       */
      const remaining = maxImages - values.length;
      if (remaining <= 0) {
        toast.warning(
          `Đã đủ ${maxImages} ảnh`,
          'Xoá bớt ảnh hiện có nếu muốn thêm ảnh khác.'
        );
        return;
      }

      const wrongType = files.filter((f) => !allowedTypes.includes(f.type));
      const validFiles = files.filter((f) => allowedTypes.includes(f.type));
      const oversized = validFiles.filter((f) => f.size > MAX_SIZE);
      const toUpload = validFiles.filter((f) => f.size <= MAX_SIZE);

      // Mỗi nguyên nhân một thông báo riêng, nói rõ file nào và vì sao bị loại.
      if (wrongType.length > 0) {
        toast.error(
          `${wrongType.length} file không phải ảnh`,
          `Chỉ nhận JPG, PNG, WebP, GIF. Bị bỏ qua: ${wrongType.map((f) => f.name).slice(0, 3).join(', ')}`
        );
      }
      if (oversized.length > 0) {
        toast.error(
          `${oversized.length} ảnh vượt quá 4MB`,
          `Hãy giảm dung lượng rồi tải lại: ${oversized.map((f) => f.name).slice(0, 3).join(', ')}`
        );
      }

      if (toUpload.length === 0) return;

      const limited = toUpload.slice(0, remaining);
      if (limited.length < toUpload.length) {
        toast.warning(
          `Chỉ tải lên ${limited.length} ảnh`,
          `Còn trống ${remaining} chỗ trong tổng số ${maxImages} ảnh.`
        );
      }

      setIsUploading(true);
      setUploadProgress('0%');
      await startUpload(limited);
    },
    [startUpload, values, maxImages, toast]
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) await handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) await handleFiles(files);
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newUrls = values.filter((_, i) => i !== index);
      onChange(newUrls);
    },
    [values, onChange]
  );

  const handleSetPrimary = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newUrls = [...values];
      const [item] = newUrls.splice(index, 1);
      newUrls.unshift(item);
      onChange(newUrls);
    },
    [values, onChange]
  );

  const canAddMore = values.length < maxImages && !isUploading;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {values.length}/{maxImages} ảnh
        </span>
      </div>

      {/* Preview grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {values.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Ảnh ${index + 1}`}
                className={`w-full h-full object-cover rounded-xl border-2 transition-all ${
                  index === 0
                    ? 'border-blue-500 shadow-md shadow-blue-100'
                    : 'border-gray-200 group-hover:border-gray-300'
                }`}
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
                  Chính
                </div>
              )}

              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="bg-white/90 hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg p-1.5 transition-all"
                    title="Đặt làm ảnh chính"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-lg p-1.5 transition-all"
                  title="Xóa ảnh"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more button (inside grid) */}
          {canAddMore && (
            <label
              htmlFor="multi-upload-input"
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <ImagePlus className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-[11px] text-gray-500 group-hover:text-blue-500 mt-1 transition-colors">
                Thêm ảnh
              </span>
            </label>
          )}
        </div>
      )}

      {/* Drop zone (only show when empty) */}
      {values.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <label htmlFor="multi-upload-input" className="flex flex-col items-center cursor-pointer">
            {isUploading ? (
              <div className="flex flex-col items-center text-blue-600">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  {uploadProgress && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {uploadProgress}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium">Đang upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <UploadCloud className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Kéo thả hoặc{' '}
                  <span className="text-blue-600 underline underline-offset-2">chọn ảnh</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF — Tối đa 4MB/ảnh</p>
                <p className="text-xs text-gray-500 mt-0.5">Có thể chọn nhiều ảnh cùng lúc</p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Upload progress bar when images exist */}
      {isUploading && values.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-blue-700 mb-1">
              <span className="font-medium">Đang upload ảnh...</span>
              <span>{uploadProgress}</span>
            </div>
            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: uploadProgress || '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input
        id="multi-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={handleInputChange}
        disabled={isUploading || !canAddMore}
      />

      {/* Helper text */}
      {values.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 Ảnh đầu tiên là <span className="font-medium text-blue-600">ảnh chính</span> — hiển thị
          trong danh sách. Hover vào ảnh để xóa hoặc đặt làm ảnh chính.
        </p>
      )}
    </div>
  );
}
