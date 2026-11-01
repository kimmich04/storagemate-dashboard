import { useState } from 'react'
import type { DailyCount } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { barGap, clamp, niceCeil, showXLabel } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate } from '../../lib/format'

function Legend() {
  return (
    <div className="flex gap-4 text-xs text-ink-2">
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-series-in" />
        Nhập
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-series-out" />
        Xuất
      </span>
    </div>
  )
}

export function InOutBarChart({ daily, className }: { daily: DailyCount[]; className?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const n = daily.length
  const max = niceCeil(Math.max(...daily.flatMap((d) => [d.inCount, d.outCount])), 5)
  const gap = barGap(n)
  const grid = [0, 50, 100].map((p) => ({ pos: p, label: String(Math.round((max * p) / 100)) }))
  const tip = hover !== null && hover < n ? daily[hover] : null

  return (
    <Card title="Lượt nhập và xuất theo ngày" action={<Legend />} className={className}>
      <div className="relative h-[220px]">
        {grid.map((g) => (
          <div key={g.pos} aria-hidden="true">
            <div className="absolute right-0 left-[30px] border-t border-grid" style={{ bottom: `${g.pos}%` }} />
            <span className="absolute left-0 translate-y-1/2 text-[11px] text-faint" style={{ bottom: `${g.pos}%` }}>
              {g.label}
            </span>
          </div>
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 left-[34px] flex items-end"
          style={{ gap }}
          onMouseLeave={() => setHover(null)}
        >
          {daily.map((d, i) => (
            <div
              key={d.date}
              onMouseEnter={() => setHover(i)}
              className={cn(
                'flex h-full flex-1 basis-0 items-end justify-center gap-[2px] rounded-md',
                hover === i ? 'bg-hover-col' : 'bg-transparent',
              )}
            >
              <div className="w-[42%] max-w-4 rounded-t bg-series-in" style={{ height: `${(d.inCount / max) * 100}%` }} />
              <div className="w-[42%] max-w-4 rounded-t bg-series-out" style={{ height: `${(d.outCount / max) * 100}%` }} />
            </div>
          ))}
        </div>
        {tip && hover !== null && (
          <ChartTooltip leftPct={clamp(((hover + 0.5) / n) * 100, 12, 88)}>
            <div className="font-semibold">{fmtDate(tip.date)}</div>
            <div>
              Nhập {tip.inCount} lượt · Xuất {tip.outCount} lượt
            </div>
          </ChartTooltip>
        )}
      </div>
      <div aria-hidden="true" className="ml-[34px] flex text-[11px] text-faint" style={{ gap }}>
        {daily.map((d, i) => (
          <span
            key={d.date}
            className={cn(
              'flex-1 basis-0 whitespace-nowrap',
              i === 0 ? 'text-left' : i === n - 1 ? 'text-right' : 'text-center',
            )}
          >
            {showXLabel(i, n) ? fmtDate(d.date) : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Lượt nhập và xuất theo ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">Nhập</th>
            <th scope="col">Xuất</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <td>{fmtDate(d.date)}</td>
              <td>{d.inCount}</td>
              <td>{d.outCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
