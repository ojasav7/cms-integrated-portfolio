import { createServerFn } from '@tanstack/react-start'
import { hasDatabaseUrl } from '@/lib/db.server'
import { hasCloudinary } from '@/lib/config.server'

export const getAdminStatus = createServerFn({ method: 'GET' }).handler(
  async () => ({
    dbConfigured: hasDatabaseUrl(),
    cloudinaryConfigured: hasCloudinary(),
  }),
)
