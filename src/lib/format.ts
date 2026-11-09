/** "2026-10-28" → "28/10" */
export function fmtDate(isoDate: string): string {
  const [, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}`
}

/** 12.5 → "12,5"; 12 → "12" */
export function fmtNum(v: number): string {
  return String(Math.round(v * 10) / 10).replace('.', ',')
}

/** "2026-10-31T17:12:00+07:00" → "17:12" (giữ nguyên giờ địa phương trong chuỗi) */
export function fmtTime(isoDateTime: string): string {
  return isoDateTime.slice(11, 16)
}

export function fmtQty(v: number, unit: string): string {
  return `${fmtNum(v)} ${unit}`
}

/** "2026-10-28" → "28/10/2026" */
export function fmtDateFull(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

const EXACT = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 })

/** Số lượng đầy đủ (tối đa 3 số lẻ như DB), có dấu chấm ngăn nghìn: 1039 → "1.039", 12.5 → "12,5". */
export function fmtExact(v: number): string {
  return EXACT.format(v)
}
