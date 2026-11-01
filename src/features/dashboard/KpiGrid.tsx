import type { DashboardKpis, RangeDays } from '../../api/types'
import { cn } from '../../lib/cn'

interface Tile {
  label: string
  value: string
  unit: string
  note: string
  critical?: boolean
}

function delta(v: number, range: RangeDays): string {
  return `${v >= 0 ? '▲ +' : '▼ '}${v}% so với ${range} ngày trước`
}

export function KpiGrid({ kpis, range }: { kpis: DashboardKpis; range: RangeDays }) {
  const tiles: Tile[] = [
    { label: 'Lượt nhập', value: String(kpis.inCount), unit: 'lượt', note: delta(kpis.inDeltaPct, range) },
    { label: 'Lượt xuất', value: String(kpis.outCount), unit: 'lượt', note: delta(kpis.outDeltaPct, range) },
    {
      label: 'Dưới mức tối thiểu',
      value: String(kpis.belowMinCount),
      unit: 'nguyên liệu',
      note: kpis.belowMinCount > 0 ? '● Cần đặt hàng' : 'Đủ hàng',
      critical: kpis.belowMinCount > 0,
    },
    {
      label: 'Hiểu ngay bằng regex',
      value: String(kpis.regexRatePct),
      unit: '%',
      note: `${kpis.regexDeltaPt >= 0 ? '▲ +' : '▼ '}${kpis.regexDeltaPt} điểm so với tuần trước`,
    },
    {
      label: 'Tin phải gõ lại',
      value: String(kpis.retypeRatePct),
      unit: '%',
      note: `${kpis.retypeCount} tin trong ${range} ngày`,
    },
  ]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-[18px] py-4">
          <span className="text-[13px] text-muted">{t.label}</span>
          <span className="text-[28px] font-bold tracking-[-0.02em]">
            {t.value}
            <span className="ml-1 text-sm font-medium tracking-normal text-muted">{t.unit}</span>
          </span>
          <span className={cn('text-xs font-medium', t.critical ? 'text-critical-text' : 'text-ink-2')}>{t.note}</span>
        </div>
      ))}
    </div>
  )
}
