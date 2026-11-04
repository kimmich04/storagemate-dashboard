import { useState } from 'react'
import type { ItemRef, StockHistory } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { Skeleton } from '../../components/ui/Skeleton'
import { clamp } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate, fmtQty } from '../../lib/format'

interface Props {
  items: ItemRef[]
  itemId: string
  onItemChange: (id: string) => void
  history: StockHistory | undefined
  className?: string
}

function ItemPills({ items, itemId, onItemChange }: Pick<Props, 'items' | 'itemId' | 'onItemChange'>) {
  return (
    <div role="group" aria-label="Chọn nguyên liệu" className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const on = it.id === itemId
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            onClick={() => onItemChange(it.id)}
            className={cn(
              'min-h-8 rounded-full border px-3 py-1.5 text-xs font-semibold',
              on ? 'border-pill-on-bd bg-nav-active-bg text-nav-active-fg' : 'border-line-strong bg-surface text-ink-2',
            )}
          >
            {it.name}
          </button>
        )
      })}
    </div>
  )
}

export function StockLineChart({ items, itemId, onItemChange, history, className }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const current = items.find((i) => i.id === itemId)
  const title = `Tồn ${(history?.item.name ?? current?.name ?? '').toLowerCase()} 30 ngày qua (${history?.item.unit ?? current?.unit ?? ''})`

  if (!history) {
    return (
      <Card title={title} action={<ItemPills items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
        <Skeleton className="h-[236px]" />
      </Card>
    )
  }

  const vals = history.points.map((p) => p.qty)
  const n = vals.length
  const max = Math.ceil((Math.max(...vals, history.minQty) * 1.15) / 10) * 10
  const y = (v: number) => 200 - (v / max) * 200
  const x = (i: number) => (i / (n - 1)) * 600
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const minY = y(history.minQty)
  const unit = history.item.unit
  const last = vals[n - 1]
  const hp = hover !== null && hover < n ? hover : null

  return (
    <Card title={title} action={<ItemPills items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
      <div className="relative ml-[34px] h-[210px]">
        <span aria-hidden="true" className="absolute top-0 -left-[34px] -translate-y-1/2 text-[11px] text-faint">
          {max}
        </span>
        <span aria-hidden="true" className="absolute bottom-0 -left-[34px] translate-y-1/2 text-[11px] text-faint">
          0
        </span>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-grid" />
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-grid" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-line-strong" />
        <svg
          role="img"
          aria-label={`Biểu đồ đường tồn ${history.item.name} ${n} ngày, hiện còn ${fmtQty(last, unit)}, mức tối thiểu ${fmtQty(history.minQty, unit)}.`}
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <path
            d={`M0 ${minY} L600 ${minY}`}
            fill="none"
            stroke="var(--color-critical)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={d} fill="none" stroke="var(--color-series-in)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute right-0 -translate-y-[120%] bg-surface px-1 text-[11px] font-semibold text-critical-text"
          style={{ top: `${(minY / 200) * 100}%` }}
        >
          Mức tối thiểu {fmtQty(history.minQty, unit)}
        </span>
        <div aria-hidden="true" className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
          {vals.map((_, i) => (
            <div key={i} className="h-full flex-1 basis-0" onMouseEnter={() => setHover(i)} />
          ))}
        </div>
        {hp !== null && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 border-l border-crosshair"
              style={{ left: `${(hp / (n - 1)) * 100}%` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-series-in shadow-[0_0_0_2px_#fff]"
              style={{ left: `${(hp / (n - 1)) * 100}%`, top: `${(y(vals[hp]) / 200) * 100}%` }}
            />
            <ChartTooltip leftPct={clamp((hp / (n - 1)) * 100, 10, 88)} top={-8}>
              <div className="font-semibold">{fmtDate(history.points[hp].date)}</div>
              <div>Tồn {fmtQty(vals[hp], unit)}</div>
            </ChartTooltip>
          </>
        )}
      </div>
      <div aria-hidden="true" className="ml-[34px] flex justify-between text-[11px] text-faint">
        <span>{fmtDate(history.points[0].date)}</span>
        <span>{fmtDate(history.points[Math.min(15, n - 1)].date)}</span>
        <span>{fmtDate(history.points[n - 1].date)}</span>
      </div>
    </Card>
  )
}
