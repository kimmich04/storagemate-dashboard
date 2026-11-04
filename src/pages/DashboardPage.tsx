import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, USE_MOCK } from '../api/client'
import type { RangeDays } from '../api/types'
import { ErrorCard } from '../components/ui/ErrorCard'
import { Skeleton } from '../components/ui/Skeleton'
import { InOutBarChart } from '../features/dashboard/InOutBarChart'
import { KpiGrid } from '../features/dashboard/KpiGrid'
import { LowStockCard } from '../features/dashboard/LowStockCard'
import { PageHeader } from '../features/dashboard/PageHeader'
import { ParserQualityCard } from '../features/dashboard/ParserQualityCard'
import { RecentTransactions } from '../features/dashboard/RecentTransactions'
import { StaffTable } from '../features/dashboard/StaffTable'
import { StockLineChart } from '../features/dashboard/StockLineChart'
import { fmtDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'

function parseRange(v: string | null): RangeDays {
  return v === '14' ? 14 : v === '30' ? 30 : 7
}

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const range = parseRange(params.get('range'))
  const [itemId, setItemId] = useState('botmi')

  const summary = useAsync(() => api.getDashboard(range), [range])
  const items = useAsync(() => api.getTrackedItems(), [])
  const history = useAsync(() => api.getStockHistory(itemId), [itemId])

  const s = summary.data
  const periodLabel = s
    ? `${range} ngày qua (${fmtDate(s.from)} – ${fmtDate(s.to)})${USE_MOCK ? ' · dữ liệu mẫu' : ''}`
    : 'Đang tải…'

  return (
    <>
      <PageHeader
        periodLabel={periodLabel}
        range={range}
        onRangeChange={(r) => setParams(r === 7 ? {} : { range: String(r) }, { replace: true })}
      />

      {summary.error && <ErrorCard message={summary.error.message} onRetry={summary.reload} />}

      {!s ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-[110px]" />
            ))}
          </div>
          <div className="flex flex-wrap gap-5">
            <Skeleton className="h-[330px] flex-[2_1_520px]" />
            <Skeleton className="h-[330px] flex-[1_1_300px]" />
          </div>
        </>
      ) : (
        <>
          <KpiGrid kpis={s.kpis} range={range} />
          <div className="flex flex-wrap gap-5">
            <InOutBarChart daily={s.daily} className="flex-[2_1_520px]" />
            <LowStockCard items={s.lowStock} className="flex-[1_1_300px]" />
          </div>
          <div className="flex flex-wrap gap-5">
            <StockLineChart
              items={items.data ?? []}
              itemId={itemId}
              onItemChange={setItemId}
              history={history.data?.item.id === itemId ? history.data : undefined}
              className="flex-[2_1_520px]"
            />
            <ParserQualityCard weeks={s.parserWeekly} pendingLabels={s.pendingLabels} className="flex-[1_1_300px]" />
          </div>
          <div className="flex flex-wrap gap-5">
            <StaffTable staff={s.staff} className="flex-[1_1_420px]" />
            <RecentTransactions items={s.recent} className="flex-[1_1_420px]" />
          </div>
        </>
      )}
    </>
  )
}
