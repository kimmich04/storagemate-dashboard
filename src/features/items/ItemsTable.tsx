import type { CatalogItem } from '../../api/types'
import { cn } from '../../lib/cn'
import { fmtExact } from '../../lib/format'
import { unitLines } from './constants'

// Cột dính (Mã VT, Tên hàng) có độ rộng cố định để vị trí dính tính đúng khi cuộn ngang.
const W = { code: 96, name: 320, category: 170, unit: 96, spec: 240, minQty: 120 }

const th = 'sticky top-0 border-b border-line bg-surface px-3 py-2.5 text-xs font-medium whitespace-nowrap text-muted'
const td = 'border-b border-line-soft bg-surface px-3 py-2.5 align-top group-hover:bg-ground'

function Spec({ item }: { item: CatalogItem }) {
  const { lines, more } = unitLines(item)
  if (lines.length === 0) return <span className="text-faint">–</span>
  return (
    <div className="flex flex-col">
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
      {more > 0 && <span className="text-xs text-muted">+{more} quy cách</span>}
    </div>
  )
}

function AliasNote({ alias }: { alias: string | null }) {
  return alias ? <span className="block text-xs font-normal text-muted">Khớp qua tên gọi khác: {alias}</span> : null
}

/**
 * Bảng danh mục hàng hóa ([API-D2], chỉ đọc): cuộn ngang, cố định Mã VT + Tên bên trái, tiêu đề cố định khi cuộn dọc.
 * Cột Mã VT và Tồn tối thiểu chỉ hiện khi trang có dữ liệu (không dữ liệu thì không hiển thị).
 * Màn hình hẹp: mỗi mặt hàng là một thẻ.
 */
export function ItemsTable({ items }: { items: CatalogItem[] }) {
  const showCode = items.some((i) => i.code !== null)
  const showMin = items.some((i) => i.minQty > 0)
  const nameLeft = showCode ? W.code : 0
  const cols = [
    ...(showCode ? [W.code] : []),
    W.name,
    W.category,
    W.unit,
    W.spec,
    ...(showMin ? [W.minQty] : []),
  ]
  const minWidth = cols.reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="hidden max-h-[max(280px,calc(100vh_-_300px))] overflow-auto rounded-xl border border-line bg-surface md:block">
        <table
          className="w-full border-separate border-spacing-0 text-[13px]"
          style={{ minWidth, tableLayout: 'fixed' }}
        >
          <colgroup>
            {cols.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {showCode && (
                <th scope="col" className={cn(th, 'z-30 text-left')} style={{ left: 0 }}>
                  Mã VT
                </th>
              )}
              <th scope="col" className={cn(th, 'z-30 text-left')} style={{ left: nameLeft }}>
                Tên hàng hóa
              </th>
              <th scope="col" className={cn(th, 'z-20 text-left')}>Nhóm hàng</th>
              <th scope="col" className={cn(th, 'z-20 text-left')}>ĐVT gốc</th>
              <th scope="col" className={cn(th, 'z-20 text-left')}>Quy cách đóng gói</th>
              {showMin && <th scope="col" className={cn(th, 'z-20 text-right')}>Tồn tối thiểu</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="group">
                {showCode && (
                  <td className={cn(td, 'sticky z-10 text-muted')} style={{ left: 0 }}>
                    {it.code ?? <span className="text-faint">–</span>}
                  </td>
                )}
                <td
                  className={cn(td, 'sticky z-10 font-semibold shadow-[1px_0_0_var(--color-line)]')}
                  style={{ left: nameLeft }}
                >
                  <span className="break-words">{it.name}</span>
                  <AliasNote alias={it.matchedAlias} />
                </td>
                <td className={cn(td, 'text-muted')}>{it.category ?? <span className="text-faint">–</span>}</td>
                <td className={td}>{it.unit}</td>
                <td className={td}>
                  <Spec item={it} />
                </td>
                {showMin && <td className={cn(td, 'text-right')}>{it.minQty > 0 ? fmtExact(it.minQty) : '–'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
        {items.map((it) => (
          <li key={it.id} className="flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3">
            <span className="font-semibold break-words">{it.name}</span>
            <AliasNote alias={it.matchedAlias} />
            <span className="text-xs text-muted">
              {it.code ? `${it.code} · ` : ''}
              {it.category ?? 'Chưa phân nhóm'} · ĐVT {it.unit}
            </span>
            {it.units.length > 0 && (
              <span className="text-xs">
                <Spec item={it} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
