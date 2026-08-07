import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  )
}

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        tone === 'neutral' && 'bg-muted text-muted-foreground',
        tone === 'accent' && 'bg-accent/15 text-accent',
        tone === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        tone === 'danger' && 'bg-red-500/15 text-red-600 dark:text-red-400',
      )}
    >
      {children}
    </span>
  )
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}

export function Banner({
  children,
  tone = 'warning',
}: {
  children: React.ReactNode
  tone?: 'warning' | 'info'
}) {
  return (
    <div
      className={cn(
        'mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm',
        tone === 'warning' &&
          'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        tone === 'info' &&
          'border-accent/30 bg-accent/10 text-foreground',
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}
