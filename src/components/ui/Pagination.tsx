import { cn } from '../../lib/cn'

interface Props {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}

const btn =
  'min-h-9 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-ground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface'

/** Phân trang: "Hiển thị 1–50 / 109" + Trước / Sau. Ẩn khi chỉ có một trang. */
export function Pagination({ page, pageSize, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return <div className="text-xs text-muted">Hiển thị {total} / {total}</div>
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-muted">
        Hiển thị {from}–{to} / {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          ‹ Trước
        </button>
        <span className={cn('min-w-[72px] text-center text-[13px] text-ink-2')}>
          Trang {page} / {pages}
        </span>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Sau ›
        </button>
      </div>
    </nav>
  )
}
