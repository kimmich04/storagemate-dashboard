import type { StockCount } from '../../api/types'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'
import type { AsyncState } from '../../lib/useAsync'

interface Props {
  label: string
  state: AsyncState<StockCount | undefined>
  /** Thẻ đang được dùng làm bộ lọc bảng. */
  active: boolean
  onClick: () => void
  note: string
}

const base = 'flex min-w-0 flex-col gap-1.5 rounded-xl border px-[18px] py-4 text-left'

/** Thẻ thống kê bấm được để lọc bảng (plan mục 4). Số liệu lấy từ /api/stock/kpis/*. */
export function StockStatCard({ label, state, active, onClick, note }: Props) {
  const count = state.data?.count

  if (count === undefined) {
    return (
      <div className={cn(base, 'border-line bg-surface')}>
        <span className="text-[13px] text-muted">{label}</span>
        {state.error ? (
          <>
            <span className="text-[13px] text-critical-text">Không tải được</span>
            <button
              type="button"
              onClick={state.reload}
              className="w-fit rounded-md border-0 bg-transparent p-0 text-xs font-semibold text-link hover:underline"
            >
              Thử lại
            </button>
          </>
        ) : (
          <Skeleton className="h-[62px]" />
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        base,
        active ? 'border-pill-on-bd bg-nav-active-bg' : 'border-line bg-surface hover:bg-ground',
      )}
    >
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[28px] font-bold tracking-[-0.02em]">
        {count}
        <span className="ml-1 text-sm font-medium tracking-normal text-muted">mặt hàng</span>
      </span>
      <span className={cn('text-xs font-medium', active ? 'text-nav-active-fg' : 'text-ink-2')}>{note}</span>
    </button>
  )
}
