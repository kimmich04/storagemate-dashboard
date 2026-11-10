import type { CatalogItem } from '../../api/types'
import { fmtExact } from '../../lib/format'

/** Số dòng mỗi trang của bảng danh mục (plan 4d: 50; BE cho tối đa 200). */
export const ITEMS_PAGE_SIZE = 50

/** Khóa của lựa chọn "Chưa có giao dịch" trong dropdown Kho (các kho dùng chính id). */
export const NO_TX_KEY = 'no-transactions'
export const NO_TX_LABEL = 'Chưa có giao dịch'

export const LOCATION_KIND_LABEL: Record<string, string> = {
  warehouse: 'Kho tổng',
  branch: 'Chi nhánh',
}

/** Bảng chỉ hiện tối đa n dòng quy cách rồi "+n" (plan 4d.0). */
const MAX_UNIT_LINES = 2

/** Quy cách đóng gói: "1 thùng = 40 hộp", tối đa 2 dòng rồi "+n"; mặt hàng không có quy đổi thì mảng rỗng. */
export function unitLines(item: CatalogItem): { lines: string[]; more: number } {
  const all = item.units.map((u) => `1 ${u.name} = ${fmtExact(u.factor)} ${item.unit}`)
  return { lines: all.slice(0, MAX_UNIT_LINES), more: Math.max(0, all.length - MAX_UNIT_LINES) }
}
