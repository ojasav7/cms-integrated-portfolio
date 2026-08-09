import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type LiquidGlassProps = ComponentProps<'div'>

/** Frosted pill with the gradient border-ring drawn via mask-composite. */
export function LiquidGlass({ className, ...props }: LiquidGlassProps) {
  return <div className={cn('liquid-glass', className)} {...props} />
}
