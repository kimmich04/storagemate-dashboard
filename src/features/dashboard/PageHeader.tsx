import type { RangeDays } from '../../api/types'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7 ngày' },
  { value: 14, label: '14 ngày' },
  { value: 30, label: '30 ngày' },
]

interface Props {
  periodLabel: string
  range: RangeDays
  onRangeChange: (r: RangeDays) => void
}

export function PageHeader({ periodLabel, range, onRangeChange }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Tổng quan kho</h1>
        <span className="text-muted">{periodLabel}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl label="Khoảng thời gian" options={RANGE_OPTIONS} value={range} onChange={onRangeChange} />
        <button
          type="button"
          className="min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-ink hover:bg-ground"
        >
          Xuất báo cáo
        </button>
      </div>
    </div>
  )
}
