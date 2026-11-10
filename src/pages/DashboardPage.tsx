import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { RangeDays, Weeks } from '../api/types'
import { AsyncBody } from '../components/ui/AsyncBody'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorCard } from '../components/ui/ErrorCard'
import { Section } from '../components/ui/Section'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { InOutBarChart } from '../features/dashboard/InOutBarChart'
import { deltaNote, KpiTile } from '../features/dashboard/KpiTile'
import { LowStockCard } from '../features/dashboard/LowStockCard'
import { ParserQualityCard } from '../features/dashboard/ParserQualityCard'
import { RecentTransactions } from '../features/dashboard/RecentTransactions'
import { StaffTable } from '../features/dashboard/StaffTable'
import { StockLineChart } from '../features/dashboard/StockLineChart'
import { fmtDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'

const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7 ngày' },
  { value: 14, label: '14 ngày' },
  { value: 30, label: '30 ngày' },
]
const WEEK_OPTIONS: { value: Weeks; label: string }[] = [
  { value: 1, label: '1 tuần' },
  { value: 2, label: '2 tuần' },
  { value: 3, label: '3 tuần' },
  { value: 4, label: '4 tuần' },
]

function parseRange(v: string | null): RangeDays {
  return v === '14' ? 14 : v === '30' ? 30 : 7
}
function parseWeeks(v: string | null): Weeks {
  return v === '1' ? 1 : v === '2' ? 2 : v === '3' ? 3 : 4
}

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const range = parseRange(params.get('range'))
  const weeks = parseWeeks(params.get('weeks'))
  const locParam = Number(params.get('location'))
  const locationId = Number.isInteger(locParam) && locParam > 0 ? locParam : undefined
  const [pickedItem, setPickedItem] = useState<number>()

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value === undefined) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const locations = useAsync(() => api.getLocations(), [])

  // ① Hiện tại
  const belowMin = useAsync(() => api.getBelowMin(locationId), [locationId])
  const lowStock = useAsync(() => api.getLowStock(locationId), [locationId])
  const items = useAsync(() => api.getTrackedItems(locationId), [locationId])
  const itemList = items.data?.items ?? []
  const itemId = itemList.some((i) => i.id === pickedItem) ? pickedItem : itemList[0]?.id
  const history = useAsync(
    () => (itemId === undefined ? Promise.resolve(undefined) : api.getStockHistory(itemId, locationId)),
    [itemId, locationId],
  )

  // ② Theo ngày
  const stockIn = useAsync(() => api.getStockIn(range, locationId), [range, locationId])
  const stockOut = useAsync(() => api.getStockOut(range, locationId), [range, locationId])
  const inOut = useAsync(() => api.getInOut(range, locationId), [range, locationId])
  const staff = useAsync(() => api.getStaff(range, locationId), [range, locationId])

  // ③ Bot
  const regex = useAsync(() => api.getRegexRate(weeks, locationId), [weeks, locationId])
  const retype = useAsync(() => api.getRetype(weeks, locationId), [weeks, locationId])
  const parser = useAsync(() => api.getParserQuality(weeks, locationId), [weeks, locationId])
  const bot = useAsync(() => api.getBotStatus(), []) // dữ liệu mẫu, chưa có API

  // ④ Hoạt động
  const recent = useAsync(() => api.getRecentTransactions(locationId), [locationId])

  const updatedTo = inOut.data?.to

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Tổng quan kho</h1>
          <span className="text-muted">
            {updatedTo ? `Dữ liệu cập nhật đến ${fmtDate(updatedTo)}/${updatedTo.slice(0, 4)}` : 'Đang tải…'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Chọn kho"
            value={locationId ?? ''}
            onChange={(e) => setParam('location', e.target.value || undefined)}
            className="min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink"
          >
            <option value="">Kho tổng</option>
            {(locations.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-ink hover:bg-ground"
          >
            Xuất báo cáo
          </button>
        </div>
      </div>

      {locations.error && <ErrorCard message={locations.error.message} onRetry={locations.reload} />}

      <Section title="Hiện tại">
        <div className="flex flex-wrap items-stretch gap-5">
          <div className="flex min-w-[200px] flex-[0_1_240px] flex-col gap-5">
            <KpiTile
              label="Dưới mức tối thiểu"
              center
              className="flex-1"
              state={belowMin}
              view={(d) => ({
                value: String(d.count),
                unit: 'nguyên liệu',
                note: d.count > 0 ? '● Cần đặt hàng' : 'Đủ hàng',
                critical: d.count > 0,
              })}
            />
            {lowStock.data && lowStock.data.items.length > 0 && <LowStockCard items={lowStock.data.items} />}
          </div>
          <div className="min-w-0 flex-[1_1_480px]">
            {items.error ? (
              <ErrorCard message={items.error.message} onRetry={items.reload} />
            ) : history.error ? (
              <ErrorCard message={history.error.message} onRetry={history.reload} />
            ) : (
              <StockLineChart
                items={itemList}
                itemId={itemId}
                onItemChange={setPickedItem}
                history={history.data && history.data.item.id === itemId ? history.data : undefined}
              />
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Thống kê theo ngày"
        badge={`${range} ngày qua`}
        filter={
          <SegmentedControl
            label="Khoảng thời gian"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(r) => setParam('range', r === 7 ? undefined : String(r))}
          />
        }
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <KpiTile
            label="Lượt nhập"
            center
            state={stockIn}
            view={(d) => ({ value: String(d.value), unit: 'lượt', note: deltaNote(d.deltaPct, range) })}
          />
          <KpiTile
            label="Lượt xuất"
            center
            state={stockOut}
            view={(d) => ({ value: String(d.value), unit: 'lượt', note: deltaNote(d.deltaPct, range) })}
          />
        </div>
        <div className="flex flex-wrap gap-5">
          <div className="flex min-w-0 flex-[2_1_520px] flex-col">
            <AsyncBody state={inOut} skeletonClass="h-[330px]">
              {(d) => <InOutBarChart daily={d.days} />}
            </AsyncBody>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col">
            <AsyncBody state={staff} skeletonClass="h-[330px]">
              {(d) => <StaffTable staff={d.staff} />}
            </AsyncBody>
          </div>
        </div>
      </Section>

      <Section
        title="Bot"
        badge={`${weeks} tuần`}
        filter={
          <SegmentedControl
            label="Số tuần"
            options={WEEK_OPTIONS}
            value={weeks}
            onChange={(w) => setParam('weeks', w === 4 ? undefined : String(w))}
          />
        }
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <KpiTile
            label="Hiểu ngay bằng regex"
            center
            state={regex}
            view={(d) =>
              d.pct === null
                ? { value: '–', unit: '', note: 'Chưa có tin nhắn từ bot' }
                : {
                    value: String(d.pct),
                    unit: '%',
                    note:
                      d.deltaPt === null
                        ? `${weeks} tuần gần nhất`
                        : `${d.deltaPt >= 0 ? '▲ +' : '▼ −'}${Math.abs(d.deltaPt)} điểm so với ${weeks} tuần trước`,
                  }
            }
          />
          <KpiTile
            label="Tin phải gõ lại"
            center
            state={retype}
            view={(d) =>
              d.pct === null
                ? { value: '–', unit: '', note: 'Chưa có tin nhắn từ bot' }
                : { value: String(d.pct), unit: '%', note: `${d.count} tin trong ${weeks} tuần` }
            }
          />
        </div>
        <AsyncBody state={parser} skeletonClass="h-[200px]">
          {(d) => <ParserQualityCard weeks={d.weeks} pendingLabels={bot.data?.pendingLabels} />}
        </AsyncBody>
      </Section>

      <Section title="Hoạt động nhập/xuất" badge="10 mới nhất">
        <AsyncBody state={recent} skeletonClass="h-[300px]">
          {(d) =>
            d.items.length === 0 && locationId !== undefined ? (
              <EmptyState>Chưa có dữ liệu cho kho này.</EmptyState>
            ) : (
              <RecentTransactions items={d.items} />
            )
          }
        </AsyncBody>
      </Section>
    </>
  )
}
