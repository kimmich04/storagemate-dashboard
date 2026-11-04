export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const niceCeil = (v: number, step: number) => Math.max(step, Math.ceil(v / step) * step)

/** Khoảng cách giữa các cột ngày (px). */
export function barGap(n: number): number {
  if (n <= 7) return 14
  if (n <= 14) return 8
  return 3
}

/** Có hiện nhãn trục X cho cột i trong n cột không. */
export function showXLabel(i: number, n: number): boolean {
  const every = n <= 7 ? 1 : n <= 14 ? 2 : 5
  if (i === n - 2 && every > 1) return false
  return i % every === 0 || i === n - 1
}
