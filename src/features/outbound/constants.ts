import type { OutSeries } from '../../api/types'

/** Số dòng mỗi trang của bảng lượt xuất (plan: mặc định 50; BE cho tối đa 200). */
export const OUTBOUND_PAGE_SIZE = 50

/** Bảng (B) hiện tối đa n nơi nhận, còn lại gấp lại sau "Xem thêm" (plan 4c). */
export const BY_DESTINATION_VISIBLE = 8

/** Khóa của nhóm "Chưa rõ nơi nhận" trong dropdown (các nơi khác dùng chính id). */
export const UNKNOWN_KEY = 'unknown'
export const UNKNOWN_LABEL = 'Chưa rõ nơi nhận'

export const KIND_LABEL: Record<string, string> = {
  branch: 'Chi nhánh',
  partner: 'Đối tác',
}
export const kindLabel = (kind: string | null): string => (kind ? (KIND_LABEL[kind] ?? kind) : '')

// Màu cột xếp chồng theo thứ tự series do API trả (top 5 nơi nhận), "Khác" và "Chưa rõ" có màu riêng.
// Viết nguyên chuỗi class để Tailwind nhận ra.
const SERIES_BG = ['bg-series-in', 'bg-series-out', 'bg-series-3', 'bg-series-4', 'bg-series-5']

/** Màu nền (class Tailwind) của series thứ `index`; dùng chung cho cột và chú giải. */
export function seriesColor(series: OutSeries, index: number): string {
  if (series.key === 'unknown') return 'bg-crosshair'
  if (series.key === 'other') return 'bg-line-strong'
  return SERIES_BG[index % SERIES_BG.length]
}
