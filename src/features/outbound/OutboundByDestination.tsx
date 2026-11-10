import { useState } from 'react'
import type { OutByDestination } from '../../api/types'
import { cn } from '../../lib/cn'
import { fmtDateFull, fmtExact } from '../../lib/format'
import { BY_DESTINATION_VISIBLE, UNKNOWN_LABEL, kindLabel } from './constants'

interface Row {
  key: string
  name: string
  kind: string
  count: number
  itemCount: number
  lastDate: string
  unknown?: boolean
}

const th = 'border-b border-line bg-surface px-3 py-2.5 text-xs font-medium whitespace-nowrap text-muted'
const td = 'border-b border-line-soft px-3 py-2.5 whitespace-nowrap'

/**
 * Bảng (B) "Xuất theo nơi nhận" ([API-O3]): chỉ các nơi đang chọn, số lượt giảm dần, thanh tỷ lệ theo lượt.
 * Hiện tối đa 8 nơi, còn lại sau "Xem thêm". Nhóm "Chưa rõ nơi nhận" chỉ hiện khi có, kèm cảnh báo nhẹ.
 */
export function OutboundByDestination({ data }: { data: OutByDestination }) {
  const [expanded, setExpanded] = useState(false)

  const rows: Row[] = data.destinations.map((d) => ({ ...d, key: String(d.id) }))
  if (data.unknown) {
    rows.push({ key: 'unknown', name: UNKNOWN_LABEL, kind: 'unknown', ...data.unknown, unknown: true })
    rows.sort((a, b) => b.count - a.count)
  }
  const max = Math.max(1, ...rows.map((r) => r.count))
  const visible = expanded ? rows : rows.slice(0, BY_DESTINATION_VISIBLE)
  const hidden = rows.length - visible.length

  const cell = (r: Row) => (
    <span className={cn('font-semibold', r.unknown && 'text-warning-text')}>
      {r.name}
      {r.unknown && <span className="ml-2 text-xs font-normal">· thiếu thông tin nơi nhận</span>}
    </span>
  )
  const bar = (r: Row) => (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right font-semibold">{fmtExact(r.count)}</span>
      <div aria-hidden="true" className="h-2 flex-1 rounded-full bg-chip">
        <div
          className={cn('h-full rounded-full', r.unknown ? 'bg-warning' : 'bg-series-in')}
          style={{ width: `${(r.count / max) * 100}%`, minWidth: 3 }}
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr>
              <th scope="col" className={cn(th, 'text-left')}>Nơi nhận</th>
              <th scope="col" className={cn(th, 'text-left')}>Loại</th>
              <th scope="col" className={cn(th, 'w-[36%] text-left')}>Số lượt</th>
              <th scope="col" className={cn(th, 'text-right')}>Số mặt hàng</th>
              <th scope="col" className={cn(th, 'text-right')}>Lượt xuất gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.key} className="hover:bg-ground">
                <td className={td}>{cell(r)}</td>
                <td className={cn(td, 'text-muted')}>{r.unknown ? '–' : kindLabel(r.kind)}</td>
                <td className={td}>{bar(r)}</td>
                <td className={cn(td, 'text-right')}>{fmtExact(r.itemCount)}</td>
                <td className={cn(td, 'text-right')}>{fmtDateFull(r.lastDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
        {visible.map((r) => (
          <li key={r.key} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              {cell(r)}
              <span className="text-xs text-muted">{r.unknown ? '' : kindLabel(r.kind)}</span>
            </div>
            {bar(r)}
            <span className="text-xs text-muted">
              {fmtExact(r.count)} lượt · {fmtExact(r.itemCount)} mặt hàng · gần nhất {fmtDateFull(r.lastDate)}
            </span>
          </li>
        ))}
      </ul>

      {(hidden > 0 || expanded) && rows.length > BY_DESTINATION_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="min-h-9 self-start rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-ground"
        >
          {expanded ? 'Thu gọn' : `Xem thêm ${hidden} nơi`}
        </button>
      )}
    </div>
  )
}
