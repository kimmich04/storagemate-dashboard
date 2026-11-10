import type { RecentTx, TxAction } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate, fmtQty, fmtTime } from '../../lib/format'

const ACTION: Record<TxAction, { label: string; dot: string }> = {
  IN: { label: 'Nhập', dot: 'bg-series-in' },
  OUT: { label: 'Xuất', dot: 'bg-series-out' },
  WASTE: { label: 'Hỏng', dot: 'bg-critical' },
  ADJUST: { label: 'Điều chỉnh', dot: 'bg-faint' },
  TRANSFER: { label: 'Chuyển', dot: 'bg-series-3' },
  PRODUCE: { label: 'Sản xuất', dot: 'bg-series-4' },
}

function sourceLabel(t: RecentTx): string {
  switch (t.source) {
    case 'undo':
      return 'lệnh Hủy'
    case 'regex':
      return 'regex'
    case 'manual':
      return 'nhập tay'
    case 'opening':
      return 'tồn đầu'
    default:
      return `${t.source.toUpperCase()}${t.confirmed ? ' · đã OK' : ' · chờ OK'}`
  }
}

export function RecentTransactions({ items, className }: { items: RecentTx[]; className?: string }) {
  return (
    <Card title="Giao dịch gần đây" action={<a href="/giao-dich" className="text-[13px]">Xem tất cả</a>} gapClass="gap-3" className={className}>
      {items.length === 0 ? (
        <EmptyState>Chưa có giao dịch nào.</EmptyState>
      ) : (
        items.map((t) => {
          const a = t.isReversal ? { label: 'Hủy', dot: 'bg-faint' } : ACTION[t.action]
          return (
            <div key={t.id} className="flex items-center gap-3 border-b border-line-soft py-2">
              <span className="w-[84px] shrink-0 text-xs text-muted">
                {fmtDate(t.at)} {fmtTime(t.at)}
              </span>
              <span className="flex w-[84px] shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-2">
                <span aria-hidden="true" className={`size-2 rounded-[2px] ${a.dot}`} />
                {a.label}
              </span>
              <span className="min-w-0 flex-auto truncate">
                <span className="font-semibold">{fmtQty(t.qty, t.unit)}</span> {t.itemName}
                {t.isReversal ? ' (bù trừ)' : ''}
                {t.counterpart ? <span className="text-muted"> → {t.counterpart}</span> : null}{' '}
                <span className="text-muted">· {t.staffName}</span>
              </span>
              <span className="shrink-0 rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-2">{sourceLabel(t)}</span>
            </div>
          )
        })
      )}
    </Card>
  )
}
