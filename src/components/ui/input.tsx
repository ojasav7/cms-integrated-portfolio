import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  label?: string
  dark?: boolean
  error?: string
  children: React.ReactNode
}

function FieldShell({ label, dark, error, children }: FieldShellProps) {
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.2em]',
            dark ? 'text-background/50' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      )}
      {children}
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
    </label>
  )
}

const fieldBase = cn(
  'w-full rounded-xl border px-4 text-sm outline-none transition-colors',
  'bg-transparent',
  'focus:ring-2 focus:ring-offset-0',
)

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    dark?: boolean
    error?: string
  }
>(function Input({ className, label, dark, error, ...props }, ref) {
  return (
    <FieldShell label={label} dark={dark} error={error}>
      <input
        ref={ref}
        className={cn(
          fieldBase,
          'h-12',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          dark
            ? 'border-background/15 text-background placeholder:text-background/30 focus:border-accent focus:ring-accent/40'
            : 'border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/30',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string
    dark?: boolean
    error?: string
  }
>(function Textarea({ className, label, dark, error, ...props }, ref) {
  return (
    <FieldShell label={label} dark={dark} error={error}>
      <textarea
        ref={ref}
        className={cn(
          fieldBase,
          'min-h-28 resize-y py-3',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          dark
            ? 'border-background/15 text-background placeholder:text-background/30 focus:border-accent focus:ring-accent/40'
            : 'border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/30',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})
