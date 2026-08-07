import { createServerFn } from '@tanstack/react-start'
import { requireAdmin } from './auth.server'
import { uploadToCloudinary } from './cloudinary.server'

export const uploadMedia = createServerFn({ method: 'POST' })
  .validator((data: { base64: string; folder?: string }) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    return uploadToCloudinary(data.base64, data.folder)
  })
