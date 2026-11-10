import { useState } from 'react'
import { api } from '../api/client'
import type { DestinationFilter, PeriodParams } from '../api/types'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorCard } from '../components/ui/ErrorCard'
import { OptionPicker, type PickerOption } from '../components/ui/OptionPicker'
import { Pagination } from '../components/ui/Pagination'
import { Section } from '../components/ui/Section'
import { Skeleton } from '../components/ui/Skeleton'
import { OUTBOUND_PAGE_SIZE, UNKNOWN_KEY, UNKNOWN_LABEL, kindLabel } from '../features/outbound/constants'
import { OutboundByDestination } from '../features/outbound/OutboundByDestination'
import { OutboundChart } from '../features/outbound/OutboundChart'
import { OutboundTable } from '../features/outbound/OutboundTable'
import { OutboundTopItems } from '../features/outbound/OutboundTopItems'
import { PeriodFilter } from '../features/period/PeriodFilter'
import { usePeriodParams } from '../features/period/usePeriodParams'
import { cn } from '../lib/cn'
import { fmtDateFull, fmtExact } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useDebounced } from '../lib/useDebounced'

/**
 * Trang Xuất Kho (kho tổng, /giao-dich/xuat-kho). Mỗi khối gọi đúng một API (plan mục 8.3):
 *   [P0] kỳ · [O1] dropdown nơi nhận · [O2] ô (A) · [O3] bảng (B) · [O4] biểu đồ (C) · [O5] top mặt hàng (D)
 *   · [O6] danh sách lượt xuất (E).
 * Kỳ lấy từ URL (?month&from&to). Mặc định chọn tất cả nơi nhận (khi đó không gửi tham số nơi nhận → API lấy tất
 * cả, kể cả chưa rõ). Bỏ chọn hết thì không gọi O2..O6 và các khối báo "Chưa chọn nơi nhận".
 */
export default function OutboundPage() {
  const [periodParams, setPeriodParams] = usePeriodParams()

  const [queryInput, setQueryInput] = useState('')
  const q = useDebounced(queryInput.trim(), 300)

  // [P0] kỳ đã chuẩn hóa
  const period = useAsync(() => api.getPeriod(periodParams), [periodParams.month, periodParams.from, periodParams.to])
  const p = period.data
  const range: PeriodParams | undefined = p && { month: p.month, from: p.from, to: p.to }
  const rangeKey = p ? `${p.month}|${p.from}|${p.to}` : ''

  // [O1] nơi nhận có lượt xuất trong kỳ
  const destinations = useAsync(() => (range ? api.getOutDestinations(range) : none), [rangeKey])
  const options: PickerOption[] = [
    ...(destinations.data?.destinations ?? []).map((d) => ({
      key: String(d.id),
      name: d.name,
      subtitle: kindLabel(d.kind),
      count: d.count,
    })),
    ...(destinations.data?.unknown
      ? [{ key: UNKNOWN_KEY, name: UNKNOWN_LABEL, count: destinations.data.unknown.count }]
      : []),
  ]

  // Nơi nhận đang chọn. `null` = mặc định tất cả. Đổi kỳ thì danh sách nơi đổi theo → quay về tất cả
  // (so khóa kỳ với khóa lúc chọn, không cần effect).
  const [selState, setSelState] = useState<{ key: string; sel: string[] | null }>({ key: '', sel: null })
  const sel = selState.key === rangeKey ? selState.sel : null
  const allKeys = options.map((o) => o.key)
  const selected = sel ?? allKeys
  const noneSelected = sel !== null && selected.length === 0
  const onPick = (next: string[]) =>
    setSelState({ key: rangeKey, sel: next.length === allKeys.length && allKeys.every((k) => next.includes(k)) ? null : next })

  // Chọn tất cả → không gửi tham số (lấy mọi nơi, kể cả chưa rõ); chọn một phần → gửi id + cờ "chưa rõ"
  const filter: DestinationFilter =
    sel === null
      ? {}
      : {
          destinationId: selected.filter((k) => k !== UNKNOWN_KEY).map(Number),
          unknownDestination: selected.includes(UNKNOWN_KEY) ? true : undefined,
        }
  const filterKey = sel === null ? 'all' : [...selected].sort().join(',')

  // Đổi kỳ / nơi nhận / từ khóa thì về trang 1
  const tableKey = [rangeKey, filterKey, q].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const page = pageState.key === tableKey ? pageState.page : 1

  const run = !!range && !noneSelected
  // [O2] ô (A)  [O3] bảng (B)  [O4] biểu đồ (C)  [O5] top mặt hàng (D)  [O6] bảng (E)
  const total = useAsync(() => (run ? api.getOutTotal(range, filter) : none), [rangeKey, filterKey, run])
  const byDest = useAsync(() => (run ? api.getOutByDestination(range, filter) : none), [rangeKey, filterKey, run])
  const daily = useAsync(() => (run ? api.getOutDaily(range, filter) : none), [rangeKey, filterKey, run])
  const top = useAsync(() => (run ? api.getOutTopItems(range, filter, 10) : none), [rangeKey, filterKey, run])
  const table = useAsync(
    () => (run ? api.getOutTransactions({ ...range, ...filter, q: q || undefined, page, pageSize: OUTBOUND_PAGE_SIZE }) : none),
    [rangeKey, filterKey, q, page, run],
  )

  const periodLabel = p ? `${fmtDateFull(p.from)} – ${fmtDateFull(p.to)}` : ''
  const count = noneSelected ? 0 : total.data?.count

  const block = <T,>(state: { data: T | undefined; error: Error | undefined; reload: () => void }, h: string, render: (d: T) => React.ReactNode) =>
    noneSelected ? (
      <NoneSelected />
    ) : state.error ? (
      <ErrorCard message={state.error.message} onRetry={state.reload} />
    ) : state.data === undefined ? (
      <Skeleton className={h} />
    ) : (
      render(state.data)
    )

  return (
    <>
      <PageHeader title="Xuất Kho" subtitle={`Kho tổng · ${p ? periodLabel : 'Đang tải…'}`}>
        <PeriodFilter state={period} params={periodParams} onChange={setPeriodParams} />
      </PageHeader>

      <div className="flex flex-col gap-3">
        {destinations.error ? (
          <ErrorCard message={destinations.error.message} onRetry={destinations.reload} />
        ) : (
          <OptionPicker
            label="Nơi nhận"
            countUnit="lượt"
            emptyText="Không có nơi nhận"
            searchPlaceholder="Tìm nơi nhận…"
            options={options}
            selected={selected}
            onChange={onPick}
            loading={destinations.data === undefined}
          />
        )}
        {/* (A) */}
        <div className="flex w-fit flex-col gap-0.5 rounded-xl border border-line bg-surface px-4 py-2.5">
          <span className="text-xs text-muted">Tổng lượt xuất của Kho Tổng</span>
          {total.error && !noneSelected ? (
            <button type="button" onClick={total.reload} className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-critical-text">
              Không tải được · Thử lại
            </button>
          ) : count === undefined ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <span className="text-2xl font-bold">{fmtExact(count)}</span>
          )}
        </div>
      </div>

      <Section title="Xuất theo nơi nhận">
        {block(byDest, 'h-[180px]', (d) =>
          d.destinations.length === 0 && !d.unknown ? (
            <EmptyBox>{`Không có lượt xuất trong kỳ ${periodLabel}.`}</EmptyBox>
          ) : (
            <OutboundByDestination data={d} />
          ),
        )}
      </Section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {block(daily, 'h-[330px]', (d) => <OutboundChart data={d} loading={daily.loading} />)}
        {block(top, 'h-[330px]', (d) => <OutboundTopItems items={d.items} loading={top.loading} />)}
      </div>

      <Section
        title={table.data ? `Danh sách lượt xuất (${fmtExact(table.data.total)} lượt)` : 'Danh sách lượt xuất'}
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
        {block(table, 'h-[420px]', (d) =>
          d.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-6">
              <EmptyState>
                {q !== '' ? `Không có lượt xuất nào khớp "${q}" trong kỳ ${periodLabel}.` : `Không có lượt xuất trong kỳ ${periodLabel}.`}
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
              <OutboundTable items={d.items} />
              <Pagination
                page={d.page}
                pageSize={d.pageSize}
                total={d.total}
                onPage={(n) => setPageState({ key: tableKey, page: n })}
              />
            </div>
          ),
        )}
      </Section>
    </>
  )
}

const none = Promise.resolve(undefined)

function NoneSelected() {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <EmptyState>Chưa chọn nơi nhận.</EmptyState>
    </div>
  )
}

function EmptyBox({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <EmptyState>{children}</EmptyState>
    </div>
  )
}
