import { clearSession, getToken } from '../auth/session'
import * as mock from '../mocks/api'
import { ApiError } from './errors'
import type {
  BotStatus,
  DashboardSummary,
  ItemRef,
  LoginResponse,
  RangeDays,
  StockHistory,
} from './types'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE = import.meta.env.VITE_API_URL ?? ''

export { ApiError }

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      'ngrok-skip-browser-warning': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    clearSession()
    window.location.assign('/login')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export const api = {
  login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK) return mock.login(email, password)
    return http<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    })
  },
  getDashboard(range: RangeDays): Promise<DashboardSummary> {
    if (USE_MOCK) return mock.getDashboard(range)
    return http<DashboardSummary>(`/api/dashboard/summary?range=${range}`)
  },
  getTrackedItems(): Promise<ItemRef[]> {
    if (USE_MOCK) return mock.getTrackedItems()
    return http<ItemRef[]>('/api/items?tracked=true')
  },
  getStockHistory(itemId: string, days = 30): Promise<StockHistory> {
    if (USE_MOCK) return mock.getStockHistory(itemId)
    return http<StockHistory>(`/api/stock/${encodeURIComponent(itemId)}/history?days=${days}`)
  },
  getBotStatus(): Promise<BotStatus> {
    if (USE_MOCK) return mock.getBotStatus()
    return http<BotStatus>('/api/bot/status')
  },
}
