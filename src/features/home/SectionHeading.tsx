import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  eyebrow: string
  title: ReactNode
  sub?: ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  headingId?: string
}

/** Tiêu đề section kiểu ZaiPack: eyebrow viết hoa kèm gạch ngang hai bên + h2 đậm. */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'left',
  tone = 'dark',
  headingId,
}: Props) {
  const center = align === 'center'
  const eyebrowCls = tone === 'light' ? 'text-mustard' : 'text-pine'
  const dash = tone === 'light' ? 'bg-mustard' : 'bg-pine'
  return (
    <div className={cn('flex flex-col gap-4', center && 'items-center text-center')}>
      <span
        className={cn(
          'flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase',
          eyebrowCls,
        )}
      >
        <span aria-hidden="true" className={cn('h-px w-6', dash)} />
        {eyebrow}
        <span aria-hidden="true" className={cn('h-px w-6', dash)} />
      </span>
      <h2
        id={headingId}
        className={cn(
          'm-0 max-w-3xl text-3xl leading-[1.08] font-extrabold tracking-[-0.02em] sm:text-[40px]',
          tone === 'light' ? 'text-cream' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            'm-0 max-w-2xl text-[15px] leading-relaxed text-muted',
            tone === 'light' && 'text-sage',
          )}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
