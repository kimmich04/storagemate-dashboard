import { useState } from 'react'
import type { OutDaily } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { EmptyState } from '../../components/ui/EmptyState'
import { barGap, clamp, niceCeil, showXLabel } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate, fmtExact } from '../../lib/format'
import { seriesColor } from './constants'

/**
 * Biểu đồ (C) "Xu hướng xuất theo ngày" ([API-O4]): cột xếp chồng theo nơi nhận, đủ mọi ngày, ngày trống = 0.
 * Thứ tự và màu theo `series` của API; chú giải chỉ liệt kê nơi nhận thật sự có lượt trong kỳ.
 * Thang trục tự co theo giá trị lớn nhất; đoạn có ít nhất 1 lượt luôn cao tối thiểu 2px.
 */
export function OutboundChart({ data, loading }: { data: OutDaily; loading?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const { series, days } = data
  const n = days.length
  const total = days.reduce((s, d) => s + d.total, 0)
  const max = niceCeil(Math.max(0, ...days.map((d) => d.total)), 4) // bội của 4: vạch giữa luôn nguyên
  const gap = barGap(n)
  const grid = [0, 50, 100].map((p) => ({ pos: p, label: fmtExact(Math.round((max * p) / 100)) }))
  const gutter = Math.max(34, Math.max(...grid.map((g) => g.label.length)) * 7 + 10)
  const tip = hover !== null && hover < n ? days[hover] : null

  if (total === 0) {
    return (
      <Card title="Xu hướng xuất theo ngày" className={cn(loading && 'opacity-60 transition-opacity')}>
        <EmptyState>Chưa có lượt xuất nào trong kỳ này.</EmptyState>
      </Card>
    )
  }

  return (
    <Card
      title="Xu hướng xuất theo ngày"
      subtitle={`Tổng ${fmtExact(total)} lượt trong kỳ`}
      className={cn(loading && 'opacity-60 transition-opacity')}
    >
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
              {/* Xếp chồng từ dưới lên theo thứ tự series */}
              <div className="flex w-[60%] max-w-5 flex-col-reverse overflow-hidden rounded-t" style={{ height: `${(d.total / max) * 100}%` }}>
                {series.map((s, si) =>
                  d.counts[s.key] ? (
                    <div
                      key={s.key}
                      className={seriesColor(s, si)}
                      style={{ flexGrow: d.counts[s.key], flexBasis: 0, minHeight: 2 }}
                    />
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
        {tip && hover !== null && (
          <ChartTooltip leftPct={clamp(((hover + 0.5) / n) * 100, 14, 86)}>
            <div className="font-semibold">
              {fmtDate(tip.date)} · {fmtExact(tip.total)} lượt
            </div>
            {series.map((s) =>
              tip.counts[s.key] ? (
                <div key={s.key}>
                  {s.name}: {fmtExact(tip.counts[s.key])}
                </div>
              ) : null,
            )}
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
      <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-xs text-ink-2">
        {series.map((s, si) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn('size-2.5 rounded-[3px]', seriesColor(s, si))} />
            {s.name}
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Số lượt xuất theo ngày và nơi nhận</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{fmtDate(d.date)}</td>
              {series.map((s) => (
                <td key={s.key}>{d.counts[s.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
