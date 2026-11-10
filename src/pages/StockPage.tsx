import { useState } from 'react'
import { api } from '../api/client'
import type { PeriodParams, SortOrder, StockSortKey, StockStatus } from '../api/types'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorCard } from '../components/ui/ErrorCard'
import { Pagination } from '../components/ui/Pagination'
import { Section } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import { PeriodFilter } from '../features/period/PeriodFilter'
import { usePeriodParams } from '../features/period/usePeriodParams'
import { PAGE_SIZE, WAREHOUSE_ID } from '../features/stock/constants'
import { StockFilters } from '../features/stock/StockFilters'
import { StockStatCard } from '../features/stock/StockStatCard'
import { StockTable } from '../features/stock/StockTable'
import { cn } from '../lib/cn'
import { fmtDateFull } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useDebounced } from '../lib/useDebounced'

/**
 * Trang Tồn Kho (kho tổng). Mỗi khối gọi đúng một API (plan mục 8.1):
 *   [P0] /api/period · [C0] /api/items/categories · [S1-S3] /api/stock/kpis/* ·
 *   [S4] /api/stock/destinations · [S5] /api/stock
 * Kỳ lấy từ URL (?month&from&to); P0 chuẩn hóa kỳ trước, các API còn lại dùng đúng kỳ đã chuẩn hóa đó.
 */
export default function StockPage() {
  const [periodParams, setPeriodParams] = usePeriodParams()

  // Bộ lọc của bảng
  const [queryInput, setQueryInput] = useState('')
  const q = useDebounced(queryInput.trim(), 300)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<StockStatus>('all')
  const [sort, setSort] = useState<StockSortKey>('name')
  const [order, setOrder] = useState<SortOrder>('asc')

  // [P0] kỳ đã chuẩn hóa
  const period = useAsync(() => api.getPeriod(periodParams), [periodParams.month, periodParams.from, periodParams.to])
  const p = period.data
  const range: PeriodParams | undefined = p && { month: p.month, from: p.from, to: p.to }
  const rangeKey = p ? `${p.month}|${p.from}|${p.to}` : ''

  // Đổi bộ lọc/kỳ/sắp xếp thì về trang 1 (không cần effect: so khóa bộ lọc với khóa lúc chọn trang)
  const filterKey = [rangeKey, category, q, status, sort, order].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1

  const kpiFilter = { category: category ? [category] : undefined, q: q || undefined }
  const none = Promise.resolve(undefined)

  // [C0] nhóm hàng của riêng kho tổng
  const categories = useAsync(() => api.getItemCategories([WAREHOUSE_ID]), [])
  // [S1-S3] ba thẻ (không phụ thuộc trạng thái đang chọn)
  const kpiTotal = useAsync(
    () => (range ? api.getStockKpi('total-items', range, kpiFilter) : none),
    [rangeKey, category, q],
  )
  const kpiInStock = useAsync(
    () => (range ? api.getStockKpi('in-stock', range, kpiFilter) : none),
    [rangeKey, category, q],
  )
  const kpiVariance = useAsync(
    () => (range ? api.getStockKpi('variance', range, kpiFilter) : none),
    [rangeKey, category, q],
  )
  // [S4] cột nơi nhận
  const destinations = useAsync(() => (range ? api.getStockDestinations(range) : none), [rangeKey])
  // [S5] bảng chính
  const table = useAsync(
    () =>
      range
        ? api.getStock({ ...range, ...kpiFilter, status, sort, order, page, pageSize: PAGE_SIZE })
        : none,
    [rangeKey, category, q, status, sort, order, page],
  )

  const hasVariance = (kpiVariance.data?.count ?? 0) > 0
  const filtering = q !== '' || category !== '' || status !== 'all'
  const monthInfo = p?.months.find((m) => m.value === p.month)

  const clearFilters = () => {
    setQueryInput('')
    setCategory('')
    setStatus('all')
  }
  const toggleStatus = (s: StockStatus) => setStatus(status === s ? 'all' : s)
  const onSort = (key: StockSortKey) => {
    if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc')
    else {
      setSort(key)
      setOrder('asc')
    }
  }

  return (
    <>
      <PageHeader
        title="Tồn kho"
        subtitle={`Kho tổng · ${p ? `${fmtDateFull(p.from)} – ${fmtDateFull(p.to)}` : 'Đang tải…'}`}
      >
        <PeriodFilter state={period} params={periodParams} onChange={setPeriodParams} />
      </PageHeader>

      <Section title="Thống kê sơ bộ">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <StockStatCard
            label="Tổng số mặt hàng"
            state={kpiTotal}
            active={status === 'all'}
            onClick={() => setStatus('all')}
            note={status === 'all' ? 'Đang hiện tất cả' : 'Bấm để hiện tất cả'}
          />
          <StockStatCard
            label="Mặt hàng còn tồn"
            state={kpiInStock}
            active={status === 'in_stock'}
            onClick={() => toggleStatus('in_stock')}
            note={status === 'in_stock' ? 'Đang lọc · bấm để bỏ lọc' : 'Tồn cuối kỳ > 0 · bấm để lọc'}
          />
          <StockStatCard
            label="Mặt hàng có chênh lệch"
            state={kpiVariance}
            active={status === 'variance'}
            onClick={() => toggleStatus('variance')}
            note={status === 'variance' ? 'Đang lọc · bấm để bỏ lọc' : 'Bấm để lọc'}
          />
        </div>
      </Section>

      <Section
        title="Bảng dữ liệu chính"
        badge={category || undefined} // chỉ hiện khi đang lọc theo nhóm hàng (vd. "MERCHANDISE")
        filter={
          <StockFilters
            query={queryInput}
            onQuery={setQueryInput}
            category={category}
            onCategory={setCategory}
            categories={categories.data}
            status={status}
            onStatus={setStatus}
          />
        }
      >
        {categories.error && <ErrorCard message={categories.error.message} onRetry={categories.reload} />}
        {destinations.error && <ErrorCard message={destinations.error.message} onRetry={destinations.reload} />}

        {p && (
          <p className="m-0 text-xs text-muted">
            Số lượng quy về đơn vị gốc của mặt hàng. Tồn đầu kỳ = tồn trước ngày {fmtDateFull(p.from)}; tồn cuối kỳ =
            tồn đến hết ngày {fmtDateFull(p.to)}.
            {monthInfo && !monthInfo.hasData && ' Chưa có giao dịch trong tháng này, bảng hiển thị tồn mang từ các tháng trước.'}
          </p>
        )}

        {table.error ? (
          <ErrorCard message={table.error.message} onRetry={table.reload} />
        ) : !table.data ? (
          <Skeleton className="h-[420px]" />
        ) : table.data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-6">
            <EmptyState>
              {filtering
                ? 'Không có mặt hàng nào khớp bộ lọc.'
                : 'Chưa có mặt hàng nào trong sổ kho tổng tính đến ngày này.'}
            </EmptyState>
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
            <StockTable
              items={table.data.items}
              destinations={destinations.data ?? []}
              showVariance={hasVariance}
              sort={sort}
              order={order}
              onSort={onSort}
            />
            <Pagination
              page={table.data.page}
              pageSize={table.data.pageSize}
              total={table.data.total}
              onPage={(n) => setPageState({ key: filterKey, page: n })}
            />
          </div>
        )}
      </Section>
    </>
  )
}
