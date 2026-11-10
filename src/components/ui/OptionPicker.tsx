import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { fmtExact } from '../../lib/format'

export interface PickerOption {
  key: string
  name: string
  /** Dòng phụ dưới tên (vd. "Chi nhánh"). */
  subtitle?: string
  /** Số đếm hiện bên phải (vd. số lượt, số mặt hàng). */
  count: number
}

interface Props {
  /** Nhãn đứng trước nút, vd. "Nơi nhận" / "Kho". */
  label: string
  /** Chữ sau số đếm của mỗi dòng, vd. "lượt" / "mặt hàng". */
  countUnit: string
  options: PickerOption[]
  /** Các khóa đang tick. */
  selected: string[]
  onChange: (next: string[]) => void
  loading?: boolean
  /** Chữ trên nút khi không có lựa chọn nào, vd. "Không có nơi nhận". */
  emptyText?: string
  searchPlaceholder?: string
}

const btn =
  'min-h-9 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-ground'

/**
 * Dropdown chọn nhiều dùng chung (plan 4c "Nơi nhận", 4d "Kho"): Chọn tất cả / Bỏ chọn tất cả, tick từng mục,
 * ô tìm, kèm số đếm. Màn hình rộng: bảng thả xuống; màn hình hẹp: mở toàn màn hình, có nút "Xong".
 */
export function OptionPicker({
  label,
  countUnit,
  options,
  selected,
  onChange,
  loading,
  emptyText = 'Không có lựa chọn',
  searchPlaceholder = 'Tìm…',
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const chosen = new Set(selected)
  const buttonText = loading ? 'Đang tải…' : options.length === 0 ? emptyText : `Đã chọn ${selected.length}/${options.length}`
  const needle = search.trim().toLowerCase()
  const shown = needle ? options.filter((o) => o.name.toLowerCase().includes(needle)) : options

  const toggle = (key: string) => onChange(chosen.has(key) ? selected.filter((k) => k !== key) : [...selected, key])

  return (
    <div ref={root} className="relative flex flex-wrap items-center gap-3">
      <span className="text-[13px] text-muted">{label}:</span>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        disabled={loading || options.length === 0}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink disabled:opacity-60"
      >
        {buttonText}
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('text-link transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="group"
          aria-label={`Chọn ${label.toLowerCase()}`}
          className="fixed inset-0 z-50 flex flex-col gap-3 bg-surface p-4 sm:absolute sm:inset-auto sm:top-full sm:left-14 sm:mt-2 sm:max-h-[440px] sm:w-[360px] sm:rounded-xl sm:border sm:border-line sm:p-3 sm:shadow-lg"
        >
          <input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-10 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] text-ink"
          />
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => onChange(options.map((o) => o.key))}>
              Chọn tất cả
            </button>
            <button type="button" className={btn} onClick={() => onChange([])}>
              Bỏ chọn tất cả
            </button>
          </div>
          <ul className="m-0 flex min-h-0 flex-1 list-none flex-col gap-0.5 overflow-y-auto p-0">
            {shown.length === 0 && <li className="py-4 text-center text-[13px] text-muted">Không có mục nào khớp.</li>}
            {shown.map((o) => (
              <li key={o.key}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-ground">
                  <input
                    type="checkbox"
                    checked={chosen.has(o.key)}
                    onChange={() => toggle(o.key)}
                    className="size-4 accent-primary"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-semibold">{o.name}</span>
                    {o.subtitle && <span className="text-xs text-muted">{o.subtitle}</span>}
                  </span>
                  <span className="text-xs text-muted">
                    {fmtExact(o.count)} {countUnit}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOpen(false)} className={cn(btn, 'sm:hidden')}>
            Xong
          </button>
        </div>
      )}
    </div>
  )
}
