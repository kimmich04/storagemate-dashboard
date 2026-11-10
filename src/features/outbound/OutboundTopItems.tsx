import type { OutTopItem } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/cn'
import { fmtExact } from '../../lib/format'

/**
 * Khối (D) "Top mặt hàng được xuất" ([API-O5]): xếp theo SỐ LƯỢT xuất, vì số lượng của các mặt hàng khác
 * đơn vị (gam, cái, hộp…) không so sánh được với nhau. Tổng số lượng hiện kèm đơn vị gốc của chính mặt hàng đó.
 */
export function OutboundTopItems({ items, loading }: { items: OutTopItem[]; loading?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <Card
      title="Top mặt hàng được xuất"
      subtitle="Xếp theo số lượt xuất"
      className={cn(loading && 'opacity-60 transition-opacity')}
    >
      {items.length === 0 ? (
        <EmptyState>Chưa có lượt xuất nào trong kỳ này.</EmptyState>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((it, i) => (
            <li key={it.itemId} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[13px] font-semibold" title={it.name}>
                  <span className="mr-2 text-muted">{i + 1}.</span>
                  {it.name}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {fmtExact(it.count)} lượt · {fmtExact(it.qtyBase)} {it.unit}
                </span>
              </div>
              <div aria-hidden="true" className="h-1.5 rounded-full bg-chip">
                <div
                  className="h-full rounded-full bg-series-out"
                  style={{ width: `${(it.count / max) * 100}%`, minWidth: 3 }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
