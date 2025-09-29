'use client';

import { useState, useCallback, useRef } from 'react';
import { CldUploadButton, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { X, ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function CloudinaryUpload({ 
  label, 
  value, 
  onChange, 
  folder = 'can-dien-tu' 
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const onChangeRef = useRef(onChange);
  
  // Update ref when onChange changes
  onChangeRef.current = onChange;

  // Stable upload success handler
  const handleUploadSuccess = useCallback((result: CloudinaryUploadWidgetResults) => {
    setIsUploading(false);
    
    // Extract URL from result
    const info = result.info as CloudinaryUploadWidgetInfo;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const imageUrl = info.secure_url;
      
      // Use ref to avoid stale closure and ensure we don't interfere with parent state
      onChangeRef.current(imageUrl);
    } else {
      alert('Upload thành công nhưng không tìm thấy URL. Vui lòng thử lại.');
    }
  }, []);

  // Stable upload error handler
  const handleUploadError = useCallback((error: any) => {
    setIsUploading(false);
    alert('Upload thất bại. Vui lòng kiểm tra kết nối và thử lại.');
  }, []);

  // Stable remove image handler
  const handleRemoveImage = useCallback(() => {
    onChangeRef.current('');
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {value ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="w-32 h-32 object-cover border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <CldUploadButton
          uploadPreset="can_dien_tu_preset"
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onOpen={() => {
            setIsUploading(true);
          }}
          onClose={() => {
            setIsUploading(false);
          }}
          options={{
            folder: folder,
            maxFileSize: 5000000, // 5MB
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
            multiple: false,
            showPoweredBy: false,
            sources: ['local', 'url']
          }}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Đang upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click để upload ảnh</p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </CldUploadButton>
      )}
    </div>
  );
}
