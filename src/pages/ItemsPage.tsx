import { useState } from 'react'
import { api } from '../api/client'
import type { ItemLocationFilter } from '../api/types'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorCard } from '../components/ui/ErrorCard'
import { OptionPicker, type PickerOption } from '../components/ui/OptionPicker'
import { Pagination } from '../components/ui/Pagination'
import { Section } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import {
  ITEMS_PAGE_SIZE,
  LOCATION_KIND_LABEL,
  NO_TX_KEY,
  NO_TX_LABEL,
} from '../features/items/constants'
import { ItemsTable } from '../features/items/ItemsTable'
import { cn } from '../lib/cn'
import { fmtExact } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useDebounced } from '../lib/useDebounced'

const none = Promise.resolve(undefined)

const control = 'min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] text-ink'

/**
 * Trang Danh mục hàng hóa (/danh-muc, giai đoạn CHỈ ĐỌC: không có thêm/sửa/xóa). Mỗi khối gọi đúng một API (plan 8.4):
 *   [D1] /api/items/locations · [C0] /api/items/categories · [D2] /api/items
 * Mặc định hiện TOÀN BỘ mặt hàng: dropdown Kho tick sẵn mọi kho và "Chưa có giao dịch"; khi tick hết thì không gửi
 * tham số kho. Chọn một phần → gửi `locationId` (hợp các kho) và `noTransactions`. Bỏ chọn hết thì không gọi API.
 */
export default function ItemsPage() {
  const [queryInput, setQueryInput] = useState('')
  const q = useDebounced(queryInput.trim(), 300)
  const [category, setCategory] = useState('')

  // [D1] kho + số mặt hàng chưa có giao dịch
  const locations = useAsync(() => api.getItemLocations(), [])
  const options: PickerOption[] = locations.data
    ? [
        ...locations.data.locations.map((l) => ({
          key: String(l.id),
          name: l.name,
          subtitle: LOCATION_KIND_LABEL[l.kind] ?? l.kind,
          count: l.itemCount,
        })),
        { key: NO_TX_KEY, name: NO_TX_LABEL, subtitle: 'Mặt hàng chưa có dòng sổ nào', count: locations.data.noTransactionsCount },
      ]
    : []

  // Kho đang chọn. `null` = mặc định tất cả.
  const [sel, setSel] = useState<string[] | null>(null)
  const allKeys = options.map((o) => o.key)
  const selected = sel ?? allKeys
  const noneSelected = sel !== null && selected.length === 0
  const onPick = (next: string[]) =>
    setSel(next.length === allKeys.length && allKeys.every((k) => next.includes(k)) ? null : next)

  const filter: ItemLocationFilter =
    sel === null
      ? {}
      : {
          locationId: selected.filter((k) => k !== NO_TX_KEY).map(Number),
          noTransactions: selected.includes(NO_TX_KEY) ? true : undefined,
        }
  const filterKey = sel === null ? 'all' : [...selected].sort().join(',')
  const run = !noneSelected

  // [C0] nhóm hàng theo đúng bộ lọc kho đang chọn (số đếm khớp với bảng)
  const categories = useAsync(
    () => (run ? api.getItemCategories(filter.locationId, filter.noTransactions) : none),
    [filterKey, run],
  )
  // Nhóm đang chọn mà không còn trong bộ lọc kho mới thì coi như "Tất cả nhóm"
  const activeCategory =
    category && categories.data?.some((c) => c.name === category) ? category : ''

  // Đổi kho / nhóm / từ khóa thì về trang 1
  const tableKey = [filterKey, activeCategory, q].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const page = pageState.key === tableKey ? pageState.page : 1

  // [D2] bảng
  const table = useAsync(
    () =>
      run
        ? api.getItems({
            ...filter,
            category: activeCategory ? [activeCategory] : undefined,
            q: q || undefined,
            page,
            pageSize: ITEMS_PAGE_SIZE,
          })
        : none,
    [tableKey, page, run],
  )

  const filtering = q !== '' || activeCategory !== '' || sel !== null
  const clearFilters = () => {
    setQueryInput('')
    setCategory('')
    setSel(null)
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Danh mục hàng hóa</h1>
        <span className="text-muted">{sel === null ? 'Tất cả mặt hàng' : 'Đã lọc theo kho'}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="Tìm theo tên, Mã VT hoặc tên gọi khác"
          placeholder="Tìm tên hàng, Mã VT, tên gọi khác…"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          className={cn(control, 'w-[300px] max-w-full')}
        />
        {locations.error ? (
          <ErrorCard message={locations.error.message} onRetry={locations.reload} />
        ) : (
          <OptionPicker
            label="Kho"
            countUnit="mặt hàng"
            emptyText="Không có kho"
            searchPlaceholder="Tìm kho…"
            options={options}
            selected={selected}
            onChange={onPick}
            loading={locations.data === undefined}
          />
        )}
        <select
          aria-label="Nhóm hàng"
          value={activeCategory}
          disabled={noneSelected}
          onChange={(e) => setCategory(e.target.value)}
          className={cn(control, 'font-semibold disabled:opacity-60')}
        >
          <option value="">Tất cả nhóm hàng</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>
      {categories.error && !noneSelected && <ErrorCard message={categories.error.message} onRetry={categories.reload} />}

      <Section title={table.data && !noneSelected ? `Danh sách mặt hàng (${fmtExact(table.data.total)})` : 'Danh sách mặt hàng'}>
        {noneSelected ? (
          <div className="rounded-xl border border-line bg-surface">
            <EmptyState>Chưa chọn kho.</EmptyState>
          </div>
        ) : table.error ? (
          <ErrorCard message={table.error.message} onRetry={table.reload} />
        ) : !table.data ? (
          <Skeleton className="h-[420px]" />
        ) : table.data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-6">
            <EmptyState>{filtering ? 'Không có mặt hàng nào khớp bộ lọc.' : 'Chưa có mặt hàng nào.'}</EmptyState>
            {filtering && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-9 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-ground"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className={cn('flex flex-col gap-3', table.loading && 'opacity-60 transition-opacity')}>
            <ItemsTable items={table.data.items} />
            <Pagination
              page={table.data.page}
              pageSize={table.data.pageSize}
              total={table.data.total}
              onPage={(n) => setPageState({ key: tableKey, page: n })}
            />
          </div>
        )}
      </Section>
    </>
  )
}
