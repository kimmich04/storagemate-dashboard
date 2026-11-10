import type { CategoryCount, StockStatus } from '../../api/types'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

interface Props {
  query: string
  onQuery: (v: string) => void
  category: string
  onCategory: (v: string) => void
  categories: CategoryCount[] | undefined
  status: StockStatus
  onStatus: (v: StockStatus) => void
}

const control =
  'min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] text-ink'

/** Ô tìm tên / Mã VT, nhóm hàng, trạng thái. */
export function StockFilters({ query, onQuery, category, onCategory, categories, status, onStatus }: Props) {
  // Luôn đủ 4 lựa chọn, kể cả "Có chênh lệch" khi chưa có số liệu (khi đó lọc ra bảng trống)
  const options: { value: StockStatus; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'in_stock', label: 'Còn tồn' },
    { value: 'out_of_stock', label: 'Hết tồn' },
    { value: 'variance', label: 'Có chênh lệch' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        aria-label="Tìm theo tên hoặc Mã VT"
        placeholder="Tìm tên hàng hoặc Mã VT…"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        className={`${control} w-[260px] max-w-full`}
      />
      <select
        aria-label="Nhóm hàng"
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className={`${control} font-semibold`}
      >
        <option value="">Tất cả nhóm hàng</option>
        {(categories ?? []).map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.count})
          </option>
        ))}
      </select>
      <SegmentedControl label="Trạng thái tồn" options={options} value={status} onChange={onStatus} />
    </div>
  )
}
