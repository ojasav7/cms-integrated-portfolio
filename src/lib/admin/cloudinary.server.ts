import { v2 as cloudinary } from 'cloudinary'
import { config, hasCloudinary } from '@/lib/config.server'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

export async function uploadToCloudinary(base64: string, folder?: string) {
  if (!hasCloudinary()) {
    return {
      ok: false as const,
      error: 'Cloudinary is not configured (CLOUDINARY_* env vars).',
    }
  }
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: folder ?? 'portfolio',
      resource_type: 'auto',
    })
    return {
      ok: true as const,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}
