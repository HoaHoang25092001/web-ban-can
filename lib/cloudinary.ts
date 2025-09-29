import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to upload image
export async function uploadToCloudinary(file: File, folder: string = 'can-dien-tu') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'can_dien_tu_preset'); // Sẽ tạo preset này
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
}
