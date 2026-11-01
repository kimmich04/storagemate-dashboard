import type { ReactNode } from 'react'

export function ChartTooltip({ leftPct, top = -6, children }: { leftPct: number; top?: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-2 text-xs leading-normal text-white"
      style={{ left: `${leftPct}%`, top }}
    >
      {children}
    </div>
  )
}
