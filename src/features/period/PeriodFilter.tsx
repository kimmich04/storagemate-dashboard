import type { PeriodOptions, PeriodParams } from '../../api/types'
import { ErrorCard } from '../../components/ui/ErrorCard'
import { Skeleton } from '../../components/ui/Skeleton'
import type { AsyncState } from '../../lib/useAsync'

interface Props {
  state: AsyncState<PeriodOptions>
  params: PeriodParams
  onChange: (next: PeriodParams) => void
}

const control =
  'min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink'

/**
 * Bộ lọc kỳ dùng chung (plan mục 0): chọn THÁNG, rồi chọn khoảng ngày bất kỳ trong tháng đó.
 * Khoảng ngày chỉ để xem; đổi tháng thì khoảng ngày reset về mặc định của tháng.
 * Mọi biên (tháng chọn được, ngày nhỏ nhất/lớn nhất) lấy từ API /api/period, FE không tự tính.
 */
export function PeriodFilter({ state, params, onChange }: Props) {
  const d = state.data
  const hasParams = Boolean(params.month || params.from || params.to)

  if (state.error) {
    return (
      <ErrorCard
        message={state.error.message}
        // Tham số trên URL sai (vd. sửa tay) → quay về mặc định; không sai thì tải lại
        onRetry={() => (hasParams ? onChange({}) : state.reload())}
      />
    )
  }
  if (!d) return <Skeleton className="h-[42px] w-[440px] max-w-full" />

  // Chọn ngày: giữ from <= to bằng cách kéo đầu còn lại theo; trùng mặc định thì bỏ khỏi URL cho gọn
  const pick = (next: { from?: string; to?: string }) => {
    let from = next.from ?? d.from
    let to = next.to ?? d.to
    if (from > to) {
      if (next.from) to = from
      else from = to
    }
    const isDefault = from === d.minDate && to === d.maxDate
    onChange({ month: d.month, from: isDefault ? undefined : from, to: isDefault ? undefined : to })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Chọn tháng"
        value={d.month}
        onChange={(e) => onChange({ month: e.target.value })}
        className={control}
      >
        {[...d.months].reverse().map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
            {m.hasData ? '' : ' · chưa có giao dịch'}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-[13px] text-muted">
        Từ ngày
        <input
          type="date"
          value={d.from}
          min={d.minDate}
          max={d.maxDate}
          onChange={(e) => e.target.value && pick({ from: e.target.value })}
          className={control}
        />
      </label>
      <label className="flex items-center gap-2 text-[13px] text-muted">
        đến
        <input
          type="date"
          value={d.to}
          min={d.minDate}
          max={d.maxDate}
          onChange={(e) => e.target.value && pick({ to: e.target.value })}
          className={control}
        />
      </label>
    </div>
  )
}
