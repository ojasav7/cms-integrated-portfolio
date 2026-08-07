import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Clapperboard,
  ExternalLink,
  Image as ImageIcon,
  LayoutTemplate,
  Layers,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/admin/auth.functions'

const NAV = [
  { to: '/admin/site', label: 'Site', icon: LayoutTemplate },
  { to: '/admin/reels', label: 'Reels', icon: Clapperboard },
  { to: '/admin/content', label: 'Content', icon: Layers },
  { to: '/admin/media', label: 'Media', icon: ImageIcon },
] as const

export function AdminSidebar() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const onLogout = async () => {
    setBusy(true)
    await logout()
    navigate({ to: '/admin/login' })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-border bg-card/40 md:w-60">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4 md:px-5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-xs font-bold text-background">
          O
        </span>
        <div className="hidden md:block">
          <p className="font-display text-sm font-semibold leading-tight">
            Ojasav<span className="text-accent">.</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Studio CMS
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            activeProps={{
              className:
                'bg-muted text-foreground font-medium',
            }}
            inactiveProps={{ className: 'text-muted-foreground' }}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4.5 w-4.5 shrink-0" />
          <span className="hidden md:inline">View site</span>
        </Link>
        <button
          onClick={onLogout}
          disabled={busy}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span className="hidden md:inline">{busy ? 'Signing out…' : 'Log out'}</span>
        </button>
      </div>
    </aside>
  )
}
