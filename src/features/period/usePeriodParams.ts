import { useSearchParams } from 'react-router-dom'
import type { PeriodParams } from '../../api/types'

const KEYS = ['month', 'from', 'to'] as const

/**
 * Kỳ báo cáo lưu trên URL (?month=2026-10&from=2026-10-05&to=2026-10-20) để tải lại trang / chia sẻ link
 * vẫn giữ kỳ, và Tổng quan sau này có thể mang kỳ sang trang con. Bỏ trống = mặc định của BE (plan mục 0).
 */
export function usePeriodParams(): readonly [PeriodParams, (next: PeriodParams) => void] {
  const [params, setParams] = useSearchParams()
  const period: PeriodParams = {
    month: params.get('month') ?? undefined,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
  }
  const setPeriod = (next: PeriodParams) => {
    const sp = new URLSearchParams(params)
    for (const k of KEYS) {
      const v = next[k]
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    setParams(sp, { replace: true })
  }
  return [period, setPeriod] as const
}
