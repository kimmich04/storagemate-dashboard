import { useState } from 'react'
import { api } from '../api/client'
import type { PeriodParams } from '../api/types'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorCard } from '../components/ui/ErrorCard'
import { Pagination } from '../components/ui/Pagination'
import { Section } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import { INBOUND_PAGE_SIZE } from '../features/inbound/constants'
import { InboundChart } from '../features/inbound/InboundChart'
import { InboundTable } from '../features/inbound/InboundTable'
import { PeriodFilter } from '../features/period/PeriodFilter'
import { usePeriodParams } from '../features/period/usePeriodParams'
import { cn } from '../lib/cn'
import { fmtDateFull } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useDebounced } from '../lib/useDebounced'

/**
 * Trang Nhập Kho (kho tổng, /giao-dich/nhap-kho). Mỗi khối gọi đúng một API (plan mục 8.2):
 *   [P0] /api/period · [I1] /api/transactions/in/daily · [I2] /api/transactions?type=IN
 * Kỳ lấy từ URL (?month&from&to); P0 chuẩn hóa kỳ trước, I1/I2 dùng đúng kỳ đã chuẩn hóa đó.
 */
export default function InboundPage() {
  const [periodParams, setPeriodParams] = usePeriodParams()

  const [queryInput, setQueryInput] = useState('')
  const q = useDebounced(queryInput.trim(), 300)

  // [P0] kỳ đã chuẩn hóa
  const period = useAsync(() => api.getPeriod(periodParams), [periodParams.month, periodParams.from, periodParams.to])
  const p = period.data
  const range: PeriodParams | undefined = p && { month: p.month, from: p.from, to: p.to }
  const rangeKey = p ? `${p.month}|${p.from}|${p.to}` : ''

  // Đổi kỳ / từ khóa thì về trang 1 (so khóa bộ lọc với khóa lúc chọn trang, không cần effect)
  const filterKey = [rangeKey, q].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1

  const none = Promise.resolve(undefined)
  // [I1] biểu đồ: không phụ thuộc ô tìm (plan 4b: ô tìm chỉ lọc bảng)
  const daily = useAsync(() => (range ? api.getInDaily(range) : none), [rangeKey])
  // [I2] bảng
  const table = useAsync(
    () => (range ? api.getInTransactions({ ...range, q: q || undefined, page, pageSize: INBOUND_PAGE_SIZE }) : none),
    [rangeKey, q, page],
  )

  const periodLabel = p ? `${fmtDateFull(p.from)} – ${fmtDateFull(p.to)}` : ''
  const total = table.data?.total

  return (
    <>
      <PageHeader title="Nhập Kho" subtitle={`Kho tổng · ${p ? periodLabel : 'Đang tải…'}`}>
        <PeriodFilter state={period} params={periodParams} onChange={setPeriodParams} />
      </PageHeader>

      {daily.error ? (
        <ErrorCard message={daily.error.message} onRetry={daily.reload} />
      ) : !daily.data ? (
        <Skeleton className="h-[330px]" />
      ) : (
        <InboundChart days={daily.data.days} loading={daily.loading} />
      )}

      <Section
        title={total === undefined ? 'Danh sách lượt nhập' : `Danh sách lượt nhập (${total} lượt)`}
        filter={
          <input
            type="search"
            aria-label="Tìm theo tên hàng"
            placeholder="Tìm tên hàng…"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="min-h-[42px] w-[260px] max-w-full rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] text-ink"
          />
        }
      >
        {table.error ? (
          <ErrorCard message={table.error.message} onRetry={table.reload} />
        ) : !table.data ? (
          <Skeleton className="h-[420px]" />
        ) : table.data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-6">
            <EmptyState>
              {q !== ''
                ? `Không có lượt nhập nào khớp "${q}" trong kỳ ${periodLabel}.`
                : `Không có lượt nhập trong kỳ ${periodLabel}.`}
            </EmptyState>
            {q !== '' && (
              <button
                type="button"
                onClick={() => setQueryInput('')}
                className="min-h-9 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-ground"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className={cn('flex flex-col gap-3', table.loading && 'opacity-60 transition-opacity')}>
            <InboundTable items={table.data.items} />
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
