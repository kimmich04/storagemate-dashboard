import type { LowStockItem } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { cn } from '../../lib/cn'
import { fmtQty } from '../../lib/format'

function statusOf(it: LowStockItem) {
  const ratio = it.qty / it.minQty
  if (ratio < 1) return { label: 'Dưới mức', icon: 'alert' as const, bar: 'bg-critical', text: 'text-critical-text' }
  if (ratio < 1.6) return { label: 'Sắp chạm', icon: 'clock' as const, bar: 'bg-warning', text: 'text-warning-text' }
  return { label: 'Đủ', icon: 'clock' as const, bar: 'bg-series-in', text: 'text-ink-2' }
}

/** Chỉ render khi có mặt hàng (mặt hàng chưa đặt mức tối thiểu thì không hiện). */
export function LowStockCard({ items, className }: { items: LowStockItem[]; className?: string }) {
  return (
    <Card title="Sắp hết hàng" action={<a href="/ton-kho" className="text-[13px]">Xem tồn kho</a>} className={className}>
      {items.map((it) => {
        const s = statusOf(it)
        const days = it.avgDailyOut > 0 ? Math.floor(it.qty / it.avgDailyOut) : null
        const pct = Math.min(100, (it.qty / (it.minQty * 2)) * 100)
        return (
          <div key={it.itemId} className="flex flex-col gap-1.5 border-b border-line-soft pb-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{it.name}</span>
              <span className={cn('flex items-center gap-[5px] text-xs font-semibold', s.text)}>
                <Icon name={s.icon} />
                {s.label}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-grid">
              <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted">
              Còn {fmtQty(it.qty, it.unit)} · tối thiểu {fmtQty(it.minQty, it.unit)}
              {days === null ? '' : days <= 0 ? ' · đã hết' : ` · đủ dùng ~${days} ngày`}
            </span>
          </div>
        )
      })}
    </Card>
  )
}
