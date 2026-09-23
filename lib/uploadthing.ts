import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const f = createUploadthing();

/**
 * Chặn người lạ tải file lên kho lưu trữ.
 *
 * Trước đây middleware không kiểm tra gì: bất kỳ ai trên mạng cũng gọi được
 * endpoint tải lên và đẩy file vào tài khoản UploadThing của công ty — tốn
 * dung lượng phải trả tiền, và kho ảnh có thể bị nhồi nội dung bất kỳ.
 */
async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new UploadThingError('Bạn cần đăng nhập để tải ảnh lên');
  }
  return { uploadedAt: new Date().toISOString() };
}

export const ourFileRouter = {
  // Upload ảnh đơn (danh mục, tin tức...)
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(requireAdminSession)
    .onUploadComplete(async ({ file }) => {
      console.log('Upload complete:', file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  // Upload nhiều ảnh cho gallery sản phẩm (tối đa 10 ảnh)
  multiImageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 10,
    },
  })
    .middleware(requireAdminSession)
    .onUploadComplete(async ({ file }) => {
      console.log('Multi upload complete:', file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  /*
   * Tải ảnh thẳng vào Thư viện ảnh.
   *
   * Khác hai route trên ở chỗ ảnh không gắn với một sản phẩm hay bài viết nào
   * — chỉ đưa vào kho để dùng dần. Cho phép 20 ảnh mỗi lượt vì người dùng
   * thường chọn cả một thư mục ảnh sản phẩm mới chụp.
   */
  libraryUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 20,
    },
  })
    .middleware(requireAdminSession)
    .onUploadComplete(async ({ file }) => {
      console.log('Library upload complete:', file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
