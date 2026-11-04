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
