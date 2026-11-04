import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
  gapClass?: string
  children: ReactNode
}

export function Card({ title, subtitle, action, className, gapClass = 'gap-3.5', children }: CardProps) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn('flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5', gapClass, className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="m-0 text-base font-semibold">
            {title}
          </h2>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
