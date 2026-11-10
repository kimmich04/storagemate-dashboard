import { Link } from 'react-router-dom'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'
import type { AsyncState } from '../../lib/useAsync'

export interface TileView {
  value: string
  unit: string
  note: string
  critical?: boolean
}

interface Props<T> {
  label: string
  state: AsyncState<T>
  view: (data: T) => TileView
  center?: boolean
  className?: string
  /** Có đường dẫn thì cả ô bấm được để sang trang chi tiết (giữ nguyên kỳ). */
  to?: string
}

const BASE = 'flex min-w-0 flex-col gap-1.5 rounded-xl border border-line bg-surface px-[18px] py-4'

/** Ô số liệu tự tải: skeleton khi đang tải, báo lỗi + Thử lại khi thất bại. */
export function KpiTile<T>({ label, state, view, center, className, to }: Props<T>) {
  const v = state.data ? view(state.data) : undefined
  const failed = state.error && !v
  const cls = cn(BASE, center && 'items-center justify-center text-center', className)

  const body = (
    <>
      <span className="text-[13px] text-muted">{label}</span>
      {failed ? (
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
      ) : !v ? (
        <Skeleton className="h-[62px]" />
      ) : (
        <>
          <span className="text-[28px] font-bold tracking-[-0.02em]">
            {v.value}
            {v.unit && <span className="ml-1 text-sm font-medium tracking-normal text-muted">{v.unit}</span>}
          </span>
          <span className={cn('text-xs font-medium', v.critical ? 'text-critical-text' : 'text-ink-2')}>{v.note}</span>
        </>
      )}
    </>
  )

  // Ô đang lỗi/đang tải không biến thành link (nút "Thử lại" nằm bên trong không được lồng trong <a>)
  if (to && v) {
    return (
      <Link to={to} className={cn(cls, 'text-ink no-underline hover:bg-ground')}>
        {body}
      </Link>
    )
  }
  return <div className={cls}>{body}</div>
}

/**
 * "▲ +12% so với cùng kỳ tháng trước". Số quá lớn (tháng trước gần như trống) hiện ">999%".
 * pct = null: tháng trước không có dữ liệu để so sánh.
 */
export function deltaNote(pct: number | null): string {
  if (pct === null) return 'Chưa có số tháng trước để so sánh'
  const abs = Math.abs(pct)
  const txt = abs > 999 ? '>999' : String(abs)
  return `${pct >= 0 ? '▲ +' : '▼ −'}${txt}% so với cùng kỳ tháng trước`
}
