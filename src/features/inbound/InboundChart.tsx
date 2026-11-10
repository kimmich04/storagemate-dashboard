import { useState } from 'react'
import type { InDay } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { EmptyState } from '../../components/ui/EmptyState'
import { barGap, clamp, niceCeil, showXLabel } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate, fmtExact } from '../../lib/format'

/**
 * Biểu đồ cột "Số lượt nhập theo ngày" (plan 4b). Dữ liệu từ [API-I1]: đủ mọi ngày trong kỳ, ngày trống = 0.
 * Một series nên chỉ một màu (series-in) và không cần chú giải.
 */
export function InboundChart({ days, loading }: { days: InDay[]; loading?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const n = days.length
  const total = days.reduce((s, d) => s + d.count, 0)
  // Bội của 4 để vạch giữa (50%) luôn là số nguyên: 0-2-4, 0-8-16...
  const max = niceCeil(Math.max(0, ...days.map((d) => d.count)), 4)
  const gap = barGap(n)
  const grid = [0, 50, 100].map((p) => ({ pos: p, label: fmtExact(Math.round((max * p) / 100)) }))
  // Cột nhãn trục tung rộng theo số chữ số của nhãn dài nhất (số lớn có dấu chấm nghìn, vd. 10.000)
  const gutter = Math.max(34, Math.max(...grid.map((g) => g.label.length)) * 7 + 10)
  const tip = hover !== null && hover < n ? days[hover] : null

  // Kỳ không có lượt nhập: chỉ hiện thông báo, không vẽ lưới/trục (tránh khung trống thừa)
  if (total === 0) {
    return (
      <Card title="Số lượt nhập theo ngày" className={cn(loading && 'opacity-60 transition-opacity')}>
        <EmptyState>Chưa có lượt nhập nào trong kỳ này.</EmptyState>
      </Card>
    )
  }

  return (
    <Card title="Số lượt nhập theo ngày" subtitle={`Tổng ${fmtExact(total)} lượt trong kỳ`} className={cn(loading && 'opacity-60 transition-opacity')}>
      <div className="relative h-[220px]">
        {grid.map((g) => (
          <div key={g.pos} aria-hidden="true">
            <div className="absolute right-0 border-t border-grid" style={{ bottom: `${g.pos}%`, left: gutter - 4 }} />
            <span className="absolute left-0 translate-y-1/2 text-[11px] text-faint" style={{ bottom: `${g.pos}%` }}>
              {g.label}
            </span>
          </div>
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 flex items-end"
          style={{ gap, left: gutter }}
          onMouseLeave={() => setHover(null)}
        >
          {days.map((d, i) => (
            <div
              key={d.date}
              onMouseEnter={() => setHover(i)}
              className={cn(
                'flex h-full flex-1 basis-0 items-end justify-center rounded-md',
                hover === i ? 'bg-hover-col' : 'bg-transparent',
              )}
            >
              <div className="w-[60%] max-w-5 rounded-t bg-series-in" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 3 : 0 }} />
            </div>
          ))}
        </div>
        {tip && hover !== null && (
          <ChartTooltip leftPct={clamp(((hover + 0.5) / n) * 100, 12, 88)}>
            <div className="font-semibold">{fmtDate(tip.date)}</div>
            <div>{fmtExact(tip.count)} lượt nhập</div>
          </ChartTooltip>
        )}
      </div>
      <div aria-hidden="true" className="flex text-[11px] text-faint" style={{ gap, marginLeft: gutter }}>
        {days.map((d, i) => (
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
        <caption>Số lượt nhập theo ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">Số lượt nhập</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{fmtDate(d.date)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
