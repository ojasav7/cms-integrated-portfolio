import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createContext, useContext, useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { checkSession } from '@/lib/admin/auth.functions'
import { getAdminStatus } from '@/lib/admin/status.functions'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

interface AdminStatus {
  dbConfigured: boolean
  cloudinaryConfigured: boolean
}

const AdminStatusContext = createContext<AdminStatus>({
  dbConfigured: false,
  cloudinaryConfigured: false,
})

export const useAdminStatus = () => useContext(AdminStatusContext)

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/admin/login') return
    const ok = await checkSession()
    if (!ok) throw redirect({ to: '/admin/login' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [status, setStatus] = useState<AdminStatus>({
    dbConfigured: false,
    cloudinaryConfigured: false,
  })

  useEffect(() => {
    getAdminStatus().then(setStatus).catch(() => {})
  }, [])

  return (
    <AdminStatusContext.Provider value={status}>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-10">
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </AdminStatusContext.Provider>
  )
}
