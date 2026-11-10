import { useState } from 'react'
import type { StockHistory, TrackedItem } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { clamp } from '../../lib/chart'
import { fmtDate, fmtQty } from '../../lib/format'

interface Props {
  items: TrackedItem[]
  itemId: number | undefined
  onItemChange: (id: number) => void
  history: StockHistory | undefined
  className?: string
}

function ItemSelect({ items, itemId, onItemChange }: Pick<Props, 'items' | 'itemId' | 'onItemChange'>) {
  return (
    <select
      aria-label="Chọn nguyên liệu"
      value={itemId ?? ''}
      onChange={(e) => onItemChange(Number(e.target.value))}
      className="min-h-9 max-w-[260px] rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink"
    >
      {items.map((it) => (
        <option key={it.id} value={it.id}>
          {it.name}
        </option>
      ))}
    </select>
  )
}

export function StockLineChart({ items, itemId, onItemChange, history, className }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const current = items.find((i) => i.id === itemId)
  const title = `Tồn ${history?.item.name ?? current?.name ?? ''} 30 ngày qua (${history?.item.unit ?? current?.unit ?? ''})`

  if (items.length === 0) {
    return (
      <Card title="Tồn nguyên liệu 30 ngày qua" className={className}>
        <EmptyState>Kho này chưa có mặt hàng nào có sổ tồn.</EmptyState>
      </Card>
    )
  }

  if (!history) {
    return (
      <Card title={title} action={<ItemSelect items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
        <Skeleton className="h-[236px]" />
      </Card>
    )
  }

  if (history.points.length === 0) {
    return (
      <Card title={title} action={<ItemSelect items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
        <EmptyState>Chưa có dữ liệu tồn của mặt hàng này.</EmptyState>
      </Card>
    )
  }

  const vals = history.points.map((p) => p.qty)
  const n = vals.length
  const showMin = history.minQty > 0
  const max = Math.max(10, Math.ceil((Math.max(...vals, history.minQty) * 1.15) / 10) * 10)
  const y = (v: number) => 200 - (v / max) * 200
  const x = (i: number) => (n > 1 ? i / (n - 1) : 0) * 600
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const minY = y(history.minQty)
  const unit = history.item.unit
  const last = vals[n - 1] ?? 0
  const hp = hover !== null && hover < n ? hover : null

  return (
    <Card title={title} action={<ItemSelect items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
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
          aria-label={`Biểu đồ đường tồn ${history.item.name} ${n} ngày, hiện còn ${fmtQty(last, unit)}${showMin ? `, mức tối thiểu ${fmtQty(history.minQty, unit)}` : ''}.`}
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          {showMin && (
          <path
            d={`M0 ${minY} L600 ${minY}`}
            fill="none"
            stroke="var(--color-critical)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
          )}
          <path d={d} fill="none" stroke="var(--color-series-in)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {showMin && (
        <span
          className="absolute right-0 -translate-y-[120%] bg-surface px-1 text-[11px] font-semibold text-critical-text"
          style={{ top: `${(minY / 200) * 100}%` }}
        >
          Mức tối thiểu {fmtQty(history.minQty, unit)}
        </span>
        )}
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
              style={{ left: `${(n > 1 ? hp / (n - 1) : 0) * 100}%` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-series-in shadow-[0_0_0_2px_#fff]"
              style={{ left: `${(n > 1 ? hp / (n - 1) : 0) * 100}%`, top: `${(y(vals[hp]) / 200) * 100}%` }}
            />
            <ChartTooltip leftPct={clamp((n > 1 ? hp / (n - 1) : 0) * 100, 10, 88)} top={-8}>
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
