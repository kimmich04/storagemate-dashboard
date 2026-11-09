import { useState, type CSSProperties, type ReactNode } from 'react'
import type { SortOrder, StockDestination, StockItem, StockSortKey } from '../../api/types'
import { cn } from '../../lib/cn'
import { fmtExact } from '../../lib/format'

interface Props {
  items: StockItem[]
  /** Các nơi nhận có lượt xuất trong kỳ (API-S4): sinh ra các cột con của nhóm "Xuất". */
  destinations: StockDestination[]
  /** Chỉ hiện cột "Chênh lệch" khi có dữ liệu (plan: không dữ liệu thì không hiển thị). */
  showVariance: boolean
  sort: StockSortKey
  order: SortOrder
  onSort: (key: StockSortKey) => void
}

// Cột dính (sticky) có độ rộng CỐ ĐỊNH (px) để vị trí dính tính đúng khi cuộn ngang.
// Các cột số còn lại không có độ rộng cố định, chỉ có mức tối thiểu `flex`: nếu khung rộng hơn thì chúng
// giãn đều để bảng luôn vừa khít khung (không còn khoảng trắng bên phải), kể cả khi mở/gộp nhóm "Xuất".
const W = { code: 84, name: 280, category: 150, unit: 70, flex: 112, closing: 124, variance: 112 }
const HEAD_H = 36 // chiều cao hàng tiêu đề thứ nhất; hàng thứ hai dính bên dưới nó

const th = 'border-b border-line bg-surface px-2.5 text-xs font-medium text-muted whitespace-nowrap'
const td = 'border-b border-line-soft bg-surface px-2.5 py-2 whitespace-nowrap group-hover:bg-ground'

/** Số lượng theo đơn vị gốc; 0 trong cột phát sinh hiện "–" cho đỡ rối. */
function Movement({ v }: { v: number }) {
  return v === 0 ? <span className="text-faint">–</span> : <>{fmtExact(v)}</>
}

/**
 * Bảng chính Tồn Kho (plan mục 4): cuộn ngang, cố định Mã VT + Tên + Nhóm hàng bên trái và Tồn cuối kỳ bên phải,
 * tiêu đề cố định khi cuộn dọc. Nhóm cột "Xuất" sinh động từ danh sách nơi nhận do API trả về.
 */
export function StockTable({ items, destinations, showVariance, sort, order, onSort }: Props) {
  const [collapsed, setCollapsed] = useState(false) // gộp các cột nơi nhận thành "Tổng xuất"

  // Cột chỉ hiện khi trang hiện tại có dữ liệu
  const showCode = items.some((i) => i.code !== null)
  const showWaste = items.some((i) => i.waste !== 0)
  const showOther = items.some((i) => i.other !== 0)
  const dests = collapsed ? [] : destinations

  const nameLeft = showCode ? W.code : 0
  const categoryLeft = nameLeft + W.name
  const closingRight = showVariance ? W.variance : 0

  // fixed = độ rộng cố định (cột dính, ĐVT); không có fixed = cột giãn; min = độ rộng tối thiểu
  const cols: { fixed?: number; min: number }[] = [
    ...(showCode ? [{ fixed: W.code, min: W.code }] : []),
    { fixed: W.name, min: W.name },
    { fixed: W.category, min: W.category },
    { fixed: W.unit, min: W.unit },
    { min: W.flex }, // tồn đầu kỳ
    { min: W.flex }, // nhập
    ...dests.map(() => ({ min: W.flex })),
    { min: W.flex }, // tổng xuất
    ...(showWaste ? [{ min: W.flex }] : []),
    ...(showOther ? [{ min: W.flex }] : []),
    { fixed: W.closing, min: W.closing },
    ...(showVariance ? [{ fixed: W.variance, min: W.variance }] : []),
  ]
  const minTableWidth = cols.reduce((a, c) => a + c.min, 0)

  const ariaSort = (k: StockSortKey) => (sort === k ? (order === 'asc' ? 'ascending' : 'descending') : 'none')
  const sortButton = (k: StockSortKey, label: string): ReactNode => (
    <button
      type="button"
      onClick={() => onSort(k)}
      className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium text-inherit hover:text-ink"
    >
      {label}
      <span aria-hidden="true" className={sort === k ? 'text-ink' : 'text-faint'}>
        {sort === k ? (order === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  )

  // Ô tiêu đề chiếm 2 hàng (không thuộc nhóm Xuất)
  const tall = (extra: string, style?: CSSProperties) => ({
    rowSpan: 2,
    className: cn(th, 'sticky top-0', extra),
    style: { height: HEAD_H * 2, ...style },
  })

  return (
    // Chiều cao theo màn hình: trừ phần phía trên bảng (tiêu đề, thẻ, bộ lọc) và nút chuyển trang bên dưới,
    // để cả trang không phải cuộn; bảng tự cuộn bên trong (tiêu đề + cột dính vẫn giữ). Tối thiểu 240px.
    <div className="max-h-[max(240px,calc(100vh_-_520px))] overflow-auto rounded-xl border border-line bg-surface">
      <table
        className="border-separate border-spacing-0 text-[13px]"
        style={{ width: '100%', minWidth: minTableWidth, tableLayout: 'fixed' }}
      >
        <colgroup>
          {cols.map((c, i) => (
            <col key={i} style={c.fixed ? { width: c.fixed } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {showCode && (
              <th scope="col" aria-sort={ariaSort('code')} {...tall('z-30 text-left', { left: 0 })}>
                {sortButton('code', 'Mã VT')}
              </th>
            )}
            <th scope="col" aria-sort={ariaSort('name')} {...tall('z-30 text-left', { left: nameLeft })}>
              {sortButton('name', 'Tên hàng')}
            </th>
            <th scope="col" aria-sort={ariaSort('category')} {...tall('z-30 text-left', { left: categoryLeft })}>
              {sortButton('category', 'Nhóm hàng')}
            </th>
            <th scope="col" {...tall('z-20 text-left')}>
              ĐVT
            </th>
            <th scope="col" {...tall('z-20 text-right')}>
              Tồn đầu kỳ
            </th>
            <th scope="col" {...tall('z-20 text-right')}>
              Nhập
            </th>
            <th
              scope="colgroup"
              colSpan={dests.length + 1}
              className={cn(th, 'sticky top-0 z-20 border-l border-line text-center')}
              style={{ height: HEAD_H }}
            >
              {destinations.length > 0 ? (
                // Mũi tên cạnh chữ "Xuất" để mở/gộp các cột nơi nhận (hướng xuống = đang mở, sang phải = đang gộp)
                <button
                  type="button"
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? 'Hiện từng nơi nhận' : 'Gộp các nơi nhận thành Tổng xuất'}
                  title={collapsed ? 'Hiện từng nơi nhận' : 'Gộp thành Tổng xuất'}
                  onClick={() => setCollapsed((c) => !c)}
                  className="inline-flex items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-xs font-medium text-muted hover:bg-chip hover:text-ink"
                >
                  Xuất
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn('text-link transition-transform', collapsed && '-rotate-90')}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : (
                'Xuất'
              )}
            </th>
            {showWaste && (
              <th scope="col" {...tall('z-20 text-right')}>
                Hao hụt
              </th>
            )}
            {showOther && (
              <th scope="col" {...tall('z-20 text-right')}>
                Khác
              </th>
            )}
            <th
              scope="col"
              aria-sort={ariaSort('closing')}
              {...tall('z-30 border-l border-line text-right', { right: closingRight })}
            >
              {sortButton('closing', 'Tồn cuối kỳ')}
            </th>
            {showVariance && (
              <th
                scope="col"
                aria-sort={ariaSort('variance')}
                {...tall('z-30 border-l border-line text-right', { right: 0 })}
              >
                {sortButton('variance', 'Chênh lệch')}
              </th>
            )}
          </tr>
          <tr>
            {dests.map((d, i) => (
              <th
                key={d.id ?? 'unknown'}
                scope="col"
                title={d.name}
                className={cn(th, 'sticky z-20 truncate text-right', i === 0 && 'border-l border-line')}
                style={{ top: HEAD_H, height: HEAD_H }}
              >
                {d.name}
              </th>
            ))}
            <th
              scope="col"
              className={cn(th, 'sticky z-20 text-right font-semibold text-ink-2', dests.length === 0 && 'border-l border-line')}
              style={{ top: HEAD_H, height: HEAD_H }}
            >
              Tổng xuất
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.itemId} className="group">
              {showCode && (
                <td className={cn(td, 'sticky z-10 text-muted')} style={{ left: 0 }}>
                  {it.code ?? <span className="text-faint">–</span>}
                </td>
              )}
              <td className={cn(td, 'sticky z-10 truncate font-semibold')} style={{ left: nameLeft }} title={it.name}>
                {it.name}
              </td>
              <td
                className={cn(td, 'sticky z-10 truncate text-muted shadow-[1px_0_0_var(--color-line)]')}
                style={{ left: categoryLeft }}
                title={it.category ?? undefined}
              >
                {it.category ?? <span className="text-faint">–</span>}
              </td>
              <td className={cn(td, 'text-muted')}>{it.unit}</td>
              <td className={cn(td, 'text-right')}>{fmtExact(it.opening)}</td>
              <td className={cn(td, 'text-right')}>
                <Movement v={it.inbound} />
              </td>
              {dests.map((d, i) => (
                <td key={d.id ?? 'unknown'} className={cn(td, 'text-right', i === 0 && 'border-l border-line-soft')}>
                  <Movement v={it.outbound[d.id === null ? 'null' : String(d.id)] ?? 0} />
                </td>
              ))}
              <td className={cn(td, 'text-right font-semibold', dests.length === 0 && 'border-l border-line-soft')}>
                <Movement v={it.outboundTotal} />
              </td>
              {showWaste && (
                <td className={cn(td, 'text-right')}>
                  <Movement v={it.waste} />
                </td>
              )}
              {showOther && (
                <td className={cn(td, 'text-right')}>
                  <Movement v={it.other} />
                </td>
              )}
              <td
                className={cn(
                  td,
                  'sticky z-10 border-l border-line-soft text-right font-bold',
                  it.closing <= 0 && 'text-critical-text',
                )}
                style={{ right: closingRight }}
              >
                {fmtExact(it.closing)}
              </td>
              {showVariance && (
                <td
                  className={cn(
                    td,
                    'sticky z-10 border-l border-line-soft text-right',
                    it.variance < 0 && 'font-semibold text-critical-text',
                  )}
                  style={{ right: 0 }}
                >
                  <Movement v={it.variance} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
