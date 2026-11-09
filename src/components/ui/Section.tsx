import type { ReactNode } from 'react'

interface Props {
  title: string
  badge?: string
  filter?: ReactNode
  children: ReactNode
}

/** Một khu của trang Tổng quan: tiêu đề + huy hiệu phạm vi + (tùy chọn) bộ lọc. */
export function Section({ title, badge, filter, children }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="m-0 text-[13px] font-bold tracking-[0.04em] text-ink-2 uppercase">{title}</h2>
          {badge && (
            <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-2">{badge}</span>
          )}
        </div>
        {filter}
      </div>
      {children}
    </section>
  )
}
