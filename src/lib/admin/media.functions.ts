import { createServerFn } from '@tanstack/react-start'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from './auth.server'
import { config, hasCloudinary } from '@/lib/config.server'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

export const uploadMedia = createServerFn({ method: 'POST' })
  .validator((data: { base64: string; folder?: string }) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    if (!hasCloudinary()) {
      return {
        ok: false,
        error: 'Cloudinary is not configured (CLOUDINARY_* env vars).',
      }
    }
    try {
      const result = await cloudinary.uploader.upload(data.base64, {
        folder: data.folder ?? 'portfolio',
        resource_type: 'auto',
      })
      return {
        ok: true,
        url: result.secure_url,
        publicId: result.public_id,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  })
