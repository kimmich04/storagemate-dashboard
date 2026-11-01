import { ApiError } from '../api/errors'
import type {
  BotStatus,
  DashboardSummary,
  ItemRef,
  LoginResponse,
  RangeDays,
  StockHistory,
} from '../api/types'
import {
  belowMinCount,
  DAILY,
  ITEMS,
  lowStock,
  PARSER_WEEKS,
  PENDING_LABELS,
  RECENT,
  STAFF,
  stockHistory,
} from './data'

export const DEMO_EMAIL = 'admin@storagemate.vn'
export const DEMO_PASSWORD = 'storagemate123'

const wait = <T,>(value: T, ms = 250) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0)
const deltaPct = (cur: number, prev: number) =>
  prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100)

export async function login(email: string, password: string): Promise<LoginResponse> {
  await wait(null, 500)
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new ApiError(401, 'Sai email hoặc mật khẩu.')
  }
  return {
    access_token: 'mock.' + btoa(email) + '.' + Date.now(),
    token_type: 'bearer',
    admin: { email: DEMO_EMAIL, name: 'Chủ quán' },
  }
}

export function getDashboard(range: RangeDays): Promise<DashboardSummary> {
  const cur = DAILY.slice(-range)
  const prev = DAILY.slice(-range * 2, -range)
  const inCount = sum(cur.map((d) => d.inCount))
  const outCount = sum(cur.map((d) => d.outCount))
  return wait({
    range,
    from: cur[0].date,
    to: cur[cur.length - 1].date,
    kpis: {
      inCount,
      outCount,
      inDeltaPct: deltaPct(inCount, sum(prev.map((d) => d.inCount))),
      outDeltaPct: deltaPct(outCount, sum(prev.map((d) => d.outCount))),
      belowMinCount: belowMinCount(),
      regexRatePct: 83,
      regexDeltaPt: 3,
      retypeRatePct: 2,
      retypeCount: 6,
    },
    daily: cur,
    lowStock: lowStock(5),
    parserWeekly: PARSER_WEEKS,
    staff: STAFF,
    recent: RECENT,
    pendingLabels: PENDING_LABELS,
  })
}

export function getTrackedItems(): Promise<ItemRef[]> {
  return wait(
    ITEMS.filter((it) => it.tracked).map((it) => ({ id: it.id, name: it.name, unit: it.unit })),
  )
}

export function getStockHistory(itemId: string): Promise<StockHistory> {
  const h = stockHistory(itemId)
  if (!h) return Promise.reject(new ApiError(404, 'Không tìm thấy nguyên liệu'))
  return wait(h)
}

export function getBotStatus(): Promise<BotStatus> {
  return wait({
    botName: 'Bot Storagemate',
    webhookOk: true,
    lastMessageAt: '2026-10-31T17:12:00+07:00',
    queueSize: 0,
    pendingLabels: PENDING_LABELS,
  })
}
