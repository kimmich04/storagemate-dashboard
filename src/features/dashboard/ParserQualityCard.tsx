import type { ParserWeek } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { fmtDate } from '../../lib/format'

const SERIES = [
  { key: 'regex', name: 'Regex', cls: 'bg-series-in' },
  { key: 'ner', name: 'NER', cls: 'bg-series-out' },
  { key: 'llm', name: 'LLM', cls: 'bg-series-3' },
  { key: 'failed', name: 'Không hiểu', cls: 'bg-series-4' },
] as const

export function ParserQualityCard({ weeks, pendingLabels, className }: { weeks: ParserWeek[]; pendingLabels: number; className?: string }) {
  return (
    <Card
      title="Bot hiểu tin nhắn bằng gì"
      subtitle={`Tỉ lệ tin nhắn kho theo bậc parser, ${weeks.length} tuần gần nhất`}
      className={className}
    >
      <div className="flex flex-wrap gap-3 text-xs text-ink-2">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${s.cls}`} />
            {s.name}
          </span>
        ))}
      </div>
      {weeks.map((w) => {
        const summary = SERIES.map((s) => `${s.name} ${w[s.key]}%`).join(' · ')
        return (
          <div key={w.weekStart} className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-2 text-xs">
              <span className="shrink-0 whitespace-nowrap text-muted">Tuần {fmtDate(w.weekStart)}</span>
              <span className="text-right text-ink-2">{summary}</span>
            </div>
            <div role="img" aria-label={`Tuần ${fmtDate(w.weekStart)}: ${summary}`} className="flex h-3.5 gap-[2px]">
              {SERIES.map((s, j) => (
                <div
                  key={s.key}
                  className={`${s.cls} ${j === 0 ? 'rounded-l' : ''} ${j === SERIES.length - 1 ? 'rounded-r' : ''}`}
                  style={{ width: `${w[s.key]}%` }}
                />
              ))}
            </div>
          </div>
        )
      })}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3 text-[13px]">
        <span className="text-ink-2">{pendingLabels} mẫu do NER/LLM đọc chờ duyệt</span>
        <a href="/duyet-nhan">Duyệt nhãn</a>
      </div>
    </Card>
  )
}
