import { api } from '../api/client'
import type { PeriodParams } from '../api/types'
import { PageHeader } from '../components/layout/PageHeader'
import { AsyncBody } from '../components/ui/AsyncBody'
import { PeriodFilter } from '../features/period/PeriodFilter'
import { usePeriodParams } from '../features/period/usePeriodParams'
import { InOutBarChart } from '../features/dashboard/InOutBarChart'
import { deltaNote, KpiTile } from '../features/dashboard/KpiTile'
import { RecentTransactions } from '../features/dashboard/RecentTransactions'
import { StaffTable } from '../features/dashboard/StaffTable'
import { TopDestinations } from '../features/dashboard/TopDestinations'
import { fmtDateFull } from '../lib/format'
import { useAsync } from '../lib/useAsync'

const TOP_DESTINATIONS = 5

/** Chờ kỳ chuẩn hóa từ [P0]: chưa gọi API nào, các khối hiện skeleton (kiểu `never` để không lẫn `undefined`). */
const none = new Promise<never>(() => {})

/** Đường dẫn trang con, mang theo kỳ đang xem để số ở trang con khớp với ô vừa bấm. */
function withPeriod(path: string, p: PeriodParams | undefined): string {
  if (!p?.month) return path
  const sp = new URLSearchParams({ month: p.month, from: p.from ?? '', to: p.to ?? '' })
  return `${path}?${sp.toString()}`
}

/**
 * Trang Tổng quan (kho tổng, "/"). Mỗi khối gọi đúng một API (plan mục 8.5):
 *   [P0] kỳ · [T1..T4] bốn ô KPI · [T5] ô Còn tồn · [T6] biểu đồ cột · [T7] xuất theo nơi nhận (top 5)
 *   · [T8] giao dịch gần đây.
 * Kỳ lấy từ URL (?month&from&to) và được gọi lại /api/period trước để chuẩn hóa, các API còn lại dùng kỳ đã chuẩn hóa.
 */
export default function DashboardPage() {
  const [periodParams, setPeriodParams] = usePeriodParams()

  // [P0] kỳ đã chuẩn hóa
  const period = useAsync(() => api.getPeriod(periodParams), [periodParams.month, periodParams.from, periodParams.to])
  const p = period.data
  const range: PeriodParams | undefined = p && { month: p.month, from: p.from, to: p.to }
  const rangeKey = p ? `${p.month}|${p.from}|${p.to}` : ''

  // [T1..T4] bốn ô KPI  [T5] ô Còn tồn  [T6] biểu đồ  [T7] top nơi nhận  [T8] giao dịch gần đây
  const stockIn = useAsync(() => (range ? api.getOverviewKpi('stock-in', range) : none), [rangeKey])
  const itemsIn = useAsync(() => (range ? api.getOverviewKpi('items-in', range) : none), [rangeKey])
  const stockOut = useAsync(() => (range ? api.getOverviewKpi('stock-out', range) : none), [rangeKey])
  const destinations = useAsync(() => (range ? api.getOverviewKpi('destinations', range) : none), [rangeKey])
  const inStock = useAsync(() => (range ? api.getOverviewInStock(range) : none), [rangeKey])
  const inOut = useAsync(() => (range ? api.getOverviewInOut(range) : none), [rangeKey])
  const topDest = useAsync(() => (range ? api.getOutByDestination(range, {}, TOP_DESTINATIONS) : none), [rangeKey])
  const recent = useAsync(() => api.getOverviewRecent(10), [])
  // [T9] bảng Nhân viên của kho tổng trong kỳ đang chọn
  const staff = useAsync(() => (range ? api.getOverviewStaff(range) : none), [rangeKey])

  const periodLabel = p ? `${fmtDateFull(p.from)} – ${fmtDateFull(p.to)}` : ''
  const inboundTo = withPeriod('/giao-dich/nhap-kho', range)
  const outboundTo = withPeriod('/giao-dich/xuat-kho', range)
  const stockTo = withPeriod('/ton-kho', range)

  return (
    <>
      <PageHeader title="Tổng quan" subtitle={`Kho tổng · ${p ? periodLabel : 'Đang tải…'}`}>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <PeriodFilter state={period} params={periodParams} onChange={setPeriodParams} />
          {/* Nút giữ chỗ như bản cũ, chưa nối API báo cáo (báo cáo luôn theo cả tháng dương, plan mục 0).
              Cách bộ lọc kỳ một khoảng rộng để không bị nhầm là một phần của bộ lọc. */}
          <button
            type="button"
            className="min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-ink hover:bg-ground"
          >
            Xuất báo cáo
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        <KpiTile
          label="Lượt nhập"
          to={inboundTo}
          state={stockIn}
          view={(d) => ({ value: String(d.value), unit: 'lượt', note: deltaNote(d.deltaPct) })}
        />
        <KpiTile
          label="Mặt hàng được nhập"
          to={inboundTo}
          state={itemsIn}
          view={(d) => ({ value: String(d.value), unit: 'mặt hàng', note: deltaNote(d.deltaPct) })}
        />
        <KpiTile
          label="Lượt xuất"
          to={outboundTo}
          state={stockOut}
          view={(d) => ({ value: String(d.value), unit: 'lượt', note: deltaNote(d.deltaPct) })}
        />
        <KpiTile
          label="Nơi nhận"
          to={outboundTo}
          state={destinations}
          view={(d) => ({ value: String(d.value), unit: 'nơi', note: deltaNote(d.deltaPct) })}
        />
        <KpiTile
          label="Còn tồn (cuối kỳ / đầu kỳ)"
          to={stockTo}
          state={inStock}
          view={(d) => {
            const diff = d.closing - d.opening
            return {
              // Còn tồn cuối kỳ trên số mặt hàng còn tồn đầu kỳ, vd. 107 / 109 mặt hàng
              value: String(d.closing),
              unit: `/ ${d.opening} mặt hàng`,
              note: diff === 0 ? 'Không đổi so với đầu kỳ' : `${diff > 0 ? '▲ +' : '▼ −'}${Math.abs(diff)} mặt hàng so với đầu kỳ`,
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AsyncBody state={inOut} skeletonClass="h-[330px]">
          {(d) => <InOutBarChart daily={d.days} />}
        </AsyncBody>
        <AsyncBody state={topDest} skeletonClass="h-[330px]">
          {(d) => <TopDestinations data={d} to={outboundTo} periodLabel={periodLabel} />}
        </AsyncBody>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AsyncBody state={recent} skeletonClass="h-[300px]">
          {(d) => <RecentTransactions items={d.items} />}
        </AsyncBody>
        <AsyncBody state={staff} skeletonClass="h-[300px]">
          {(d) => <StaffTable staff={d.staff} />}
        </AsyncBody>
      </div>
    </>
  )
}
