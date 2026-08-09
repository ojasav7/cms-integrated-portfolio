import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { animate } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    getAdminStatus().then(setStatus).catch(() => {})
  }, [])

  // Entrance animation: each admin page eases in as you navigate.
  useEffect(() => {
    if (reduceMotion) return
    const main = mainRef.current
    if (!main) return
    const anim = animate(main, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 480,
      ease: 'outCubic',
    })
    return () => {
      anim.cancel()
    }
  }, [pathname, reduceMotion])

  return (
    <AdminStatusContext.Provider value={status}>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <main
          ref={mainRef}
          style={reduceMotion ? undefined : { opacity: 0 }}
          className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-10"
        >
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </AdminStatusContext.Provider>
  )
}
