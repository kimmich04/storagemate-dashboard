import { Link } from 'react-router-dom'
import type { OutByDestination } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/cn'
import { fmtExact } from '../../lib/format'
import { UNKNOWN_LABEL, kindLabel } from '../outbound/constants'

interface Props {
  data: OutByDestination
  /** Đường dẫn sang Xuất Kho, đã mang theo kỳ đang xem. */
  to: string
  periodLabel: string
}

/**
 * Khối "Xuất theo nơi nhận" ([API-T7] = [API-O3] với limit=5): thanh ngang theo số lượt, nhiều nhất trước.
 * Nhóm "Chưa rõ nơi nhận" chỉ hiện khi có và đứng theo số lượt như các nơi khác.
 */
export function TopDestinations({ data, to, periodLabel }: Props) {
  const rows = [
    ...data.destinations.map((d) => ({ key: String(d.id), name: d.name, sub: kindLabel(d.kind), count: d.count, unknown: false })),
    ...(data.unknown
      ? [{ key: 'unknown', name: UNKNOWN_LABEL, sub: '', count: data.unknown.count, unknown: true }]
      : []),
  ].sort((a, b) => b.count - a.count)
  const max = Math.max(1, ...rows.map((r) => r.count))

  return (
    <Card
      title="Xuất theo nơi nhận"
      subtitle="Số lượt xuất trong kỳ"
      action={
        <Link to={to} className="text-[13px]">
          Xem tất cả
        </Link>
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{`Không có lượt xuất trong kỳ ${periodLabel}.`}</EmptyState>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((r) => (
            <li key={r.key} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className={cn('min-w-0 truncate font-semibold', r.unknown && 'text-warning-text')}>
                  {r.name}
                  {r.sub && <span className="ml-2 text-xs font-normal text-muted">{r.sub}</span>}
                </span>
                <span className="shrink-0 font-semibold">{fmtExact(r.count)}</span>
              </div>
              <div aria-hidden="true" className="h-2 rounded-full bg-chip">
                <div
                  className={cn('h-full rounded-full', r.unknown ? 'bg-warning' : 'bg-series-out')}
                  style={{ width: `${(r.count / max) * 100}%`, minWidth: 3 }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
