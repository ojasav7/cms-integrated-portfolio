import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Briefcase,
  Clapperboard,
  Cloud,
  Database,
  Images,
  LayoutDashboard,
  Layers,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { getCollections } from '@/lib/admin/collections.functions'
import { getReels } from '@/lib/admin/reels.functions'
import { CountUp } from '@/components/ui/count-up'
import { useAdminStatus } from './route'
import { Card, PageHeader } from '@/components/admin/ui'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const [collections, reels] = await Promise.all([getCollections(), getReels()])
    return { collections, reels }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()
  const { dbConfigured, cloudinaryConfigured } = useAdminStatus()
  const collections = data.collections

  const stats = [
    { label: 'Reels', value: data.reels.length, icon: Clapperboard },
    { label: 'Testimonials', value: collections.testimonials?.length ?? 0, icon: Quote },
    { label: 'Capabilities', value: collections.capabilities?.length ?? 0, icon: Layers },
    { label: 'Hero slides', value: collections.heroShowcase?.length ?? 0, icon: Images },
    { label: 'Stats', value: collections.stats?.length ?? 0, icon: BarChart3 },
    { label: 'Case studies', value: collections.caseStudies?.length ?? 0, icon: Briefcase },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A live snapshot of the content powering the site. Numbers count up as the page loads."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <h3 className="mb-4 mt-10 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Services
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatusCard
          ok={dbConfigured}
          icon={Database}
          title="Database"
          hint={
            dbConfigured
              ? 'Collections persist to Postgres'
              : 'Fallback content — set DATABASE_URL and run db:push'
          }
        />
        <StatusCard
          ok={cloudinaryConfigured}
          icon={Cloud}
          title="Cloudinary"
          hint={
            cloudinaryConfigured
              ? 'Media uploads ready'
              : 'Uploads disabled — add CLOUDINARY_URL'
          }
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <Card className="group transition-colors duration-300 hover:border-accent/50">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-accent/15 group-hover:text-accent">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <CountUp
        value={String(value)}
        className="mt-5 block font-display text-4xl font-semibold tracking-tight text-foreground tabular-nums"
      />
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </Card>
  )
}

function StatusCard({
  ok,
  icon: Icon,
  title,
  hint,
}: {
  ok: boolean
  icon: LucideIcon
  title: string
  hint: string
}) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            ok
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold tracking-tight">{title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <span
        className={cn(
          'flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider',
          ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        )}
      >
        <span className={cn('h-2 w-2 rounded-full', ok ? 'bg-emerald-500' : 'bg-amber-500')} />
        {ok ? 'Connected' : 'Fallback'}
      </span>
    </Card>
  )
}
