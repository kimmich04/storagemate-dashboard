import type { RecentTx } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { fmtQty, fmtTime } from '../../lib/format'

const ACTION = {
  IN: { label: 'Nhập', dot: 'bg-series-in' },
  OUT: { label: 'Xuất', dot: 'bg-series-out' },
  REVERSE: { label: 'Hủy', dot: 'bg-faint' },
} as const

function sourceLabel(t: RecentTx): string {
  if (t.source === 'undo') return 'lệnh Hủy'
  if (t.source === 'regex') return 'regex'
  return `${t.source.toUpperCase()}${t.confirmed ? ' · đã OK' : ' · chờ OK'}`
}

export function RecentTransactions({ items, className }: { items: RecentTx[]; className?: string }) {
  return (
    <Card title="Giao dịch gần đây" action={<a href="/giao-dich" className="text-[13px]">Xem tất cả</a>} gapClass="gap-3" className={className}>
      {items.map((t) => {
        const a = ACTION[t.action]
        return (
          <div key={t.id} className="flex items-center gap-3 border-b border-line-soft py-2">
            <span className="w-11 shrink-0 text-xs text-muted">{fmtTime(t.at)}</span>
            <span className="flex w-[58px] shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-2">
              <span aria-hidden="true" className={`size-2 rounded-[2px] ${a.dot}`} />
              {a.label}
            </span>
            <span className="min-w-0 flex-auto truncate">
              <span className="font-semibold">{fmtQty(t.qty, t.unit)}</span> {t.itemName}
              {t.action === 'REVERSE' ? ' (bù trừ)' : ''} <span className="text-muted">· {t.staffName}</span>
            </span>
            <span className="shrink-0 rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-2">{sourceLabel(t)}</span>
          </div>
        )
      })}
    </Card>
  )
}
