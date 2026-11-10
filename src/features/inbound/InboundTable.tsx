import type { InTransaction } from '../../api/types'
import { cn } from '../../lib/cn'
import { fmtDateFull, fmtExact } from '../../lib/format'

const th = 'sticky top-0 z-10 border-b border-line bg-surface px-3 py-2.5 text-xs font-medium whitespace-nowrap text-muted'
const td = 'border-b border-line-soft px-3 py-2.5 whitespace-nowrap'

/**
 * Bảng "Danh sách lượt nhập" ([API-I2]): mỗi dòng một lượt nhập, mới nhất trước.
 * Số lượng luôn đi kèm ĐVT của chính dòng, không cộng dồn. Cột Mã VT chỉ hiện khi trang có Mã VT.
 * Màn hình rộng: bảng (tiêu đề cố định khi cuộn); màn hình hẹp: mỗi lượt là một thẻ (plan 4b).
 */
export function InboundTable({ items }: { items: InTransaction[] }) {
  const showCode = items.some((i) => i.code !== null)

  return (
    <>
      <div className="hidden max-h-[max(280px,calc(100vh_-_260px))] overflow-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr>
              {showCode && (
                <th scope="col" className={cn(th, 'w-24 text-left')}>
                  Mã VT
                </th>
              )}
              <th scope="col" className={cn(th, 'text-left')}>
                Tên hàng
              </th>
              <th scope="col" className={cn(th, 'w-24 text-left')}>
                ĐVT
              </th>
              <th scope="col" className={cn(th, 'w-32 text-left')}>
                Ngày nhập
              </th>
              <th scope="col" className={cn(th, 'w-32 text-right')}>
                Số lượng
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-ground">
                {showCode && <td className={cn(td, 'text-muted')}>{it.code ?? <span className="text-faint">–</span>}</td>}
                <td className={cn(td, 'max-w-0 truncate font-semibold')} title={it.name}>
                  {it.name}
                </td>
                <td className={cn(td, 'text-muted')}>{it.unit}</td>
                <td className={td}>{fmtDateFull(it.eventDate)}</td>
                <td className={cn(td, 'text-right font-semibold')}>{fmtExact(it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold break-words">{it.name}</span>
              <span className="text-xs text-muted">
                {it.code ? `${it.code} · ` : ''}
                {it.unit} · {fmtDateFull(it.eventDate)}
              </span>
            </div>
            <span className="shrink-0 font-bold">SL {fmtExact(it.qty)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
