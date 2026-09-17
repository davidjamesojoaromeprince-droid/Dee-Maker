export type CloudinaryResourceType = 'image' | 'video' | 'raw';

/**
 * Uploads a file directly to Cloudinary from the browser using an unsigned upload preset.
 * This completely bypasses the server proxy layer, avoiding server request size and memory limits.
 *
 * @param file The file to upload (Image, Video, or Raw app package)
 * @param resourceType 'image' | 'video' | 'raw' (defaults to 'image')
 * @returns Promise<{ url: string; publicId: string }>
 */
export async function uploadToCloudinaryDirect(
  file: File,
  resourceType: CloudinaryResourceType = 'image'
): Promise<{ url: string; publicId: string }> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vhbxqrzq';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'dee_maker_uploads';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'dee-maker-uploads');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
  };
}
