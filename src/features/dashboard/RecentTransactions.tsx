import { Link } from 'react-router-dom'
import type { OverviewRecentTx } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDateFull, fmtExact } from '../../lib/format'
import { UNKNOWN_LABEL } from '../outbound/constants'

const KIND = {
  in: { label: 'Nhập', dot: 'bg-series-in', to: '/giao-dich/nhap-kho' },
  out: { label: 'Xuất', dot: 'bg-series-out', to: '/giao-dich/xuat-kho' },
} as const

/** "Nhập" / "Xuất cho 220 Lê Thánh Tôn" / "Xuất (chưa rõ nơi nhận)": thuật ngữ nghiệp vụ, không dùng IN/OUT. */
function kindText(t: OverviewRecentTx): string {
  if (t.kind === 'in') return KIND.in.label
  return t.destinationName ? `Xuất cho ${t.destinationName}` : `Xuất (${UNKNOWN_LABEL.toLowerCase()})`
}

/**
 * Khối "Giao dịch gần đây" ([API-T8]): 10 lượt nhập/xuất mới nhất của kho tổng, trộn hai loại,
 * không phụ thuộc bộ lọc kỳ. Bấm một dòng → trang Nhập Kho / Xuất Kho tương ứng.
 */
export function RecentTransactions({ items, className }: { items: OverviewRecentTx[]; className?: string }) {
  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2.5">
          Giao dịch gần đây
          <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-2">
            {items.length} lượt
          </span>
        </span>
      }
      subtitle="Không phụ thuộc bộ lọc kỳ"
      gapClass="gap-1"
      className={className}
    >
      {items.length === 0 ? (
        <EmptyState>Chưa có giao dịch nào ở kho tổng.</EmptyState>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((t) => {
            const k = KIND[t.kind]
            return (
              <li key={t.id}>
                <Link
                  to={k.to}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-soft py-2.5 text-ink no-underline hover:bg-ground"
                >
                  <span className="w-[84px] shrink-0 text-xs text-muted">{fmtDateFull(t.eventDate)}</span>
                  <span className="flex min-w-[150px] shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-2 sm:w-[210px]">
                    <span aria-hidden="true" className={`size-2 shrink-0 rounded-[2px] ${k.dot}`} />
                    <span className="truncate">{kindText(t)}</span>
                  </span>
                  <span className="min-w-0 flex-auto basis-[200px] truncate">{t.name}</span>
                  <span className="shrink-0 font-semibold">
                    {fmtExact(t.qty)} {t.unit}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
