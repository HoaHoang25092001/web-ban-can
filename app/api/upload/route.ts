import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Chỉ cho phép các định dạng ảnh
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export const runtime = 'nodejs';

// Lazy init: UTApi sẽ throw nếu apiKey không hợp lệ khi module load trước khi env được đọc
// Dùng getter để tạo instance chỉ khi cần thiết (env đã sẵn sàng)
function getUTApi() {
  const secret = process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;
  if (!secret) {
    throw new Error('UPLOADTHING_TOKEN hoặc UPLOADTHING_SECRET chưa được cấu hình trong .env');
  }
  return new UTApi({ token: secret });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không có file được gửi lên' }, { status: 400 });
    }

    // Kiểm tra loại file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ hỗ trợ: JPG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Kiểm tra kích thước
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File quá lớn, tối đa 4MB' },
        { status: 400 }
      );
    }

    // Upload lên UploadThing cloud via UTApi
    const utapi = getUTApi();
    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error('UTApi error:', response.error);
      return NextResponse.json(
        { error: `Upload thất bại: ${response.error.message}` },
        { status: 500 }
      );
    }

    const url = response.data?.url;
    if (!url) {
      return NextResponse.json({ error: 'Không nhận được URL từ UploadThing' }, { status: 500 });
    }

    console.log('Upload thành công:', url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
