import { clearSession, getToken } from '../auth/session'
import * as mock from '../mocks/api'
import { ApiError } from './errors'
import type {
  BelowMinKpi,
  BotStatus,
  CategoryCount,
  CatalogQuery,
  CatalogResponse,
  CountKpi,
  DestinationFilter,
  InDaily,
  InOut,
  InTransactionsQuery,
  InTransactionsResponse,
  ItemLocations,
  OutByDestination,
  OutDaily,
  OutDestinations,
  OutTopItems,
  OutTotal,
  OutTransactionsQuery,
  OutTransactionsResponse,
  LoginResponse,
  Location,
  LowStockItem,
  ParserWeek,
  PeriodOptions,
  PeriodParams,
  RangeDays,
  RecentTx,
  RegexRateKpi,
  RetypeKpi,
  StaffStat,
  StockCount,
  StockDestination,
  StockHistory,
  StockQuery,
  StockResponse,
  TrackedItem,
  Weeks,
} from './types'

// Đăng nhập vẫn giả (BE chưa có /api/auth/login); mọi API dashboard gọi thật.
// Khi BE có login thật: đổi thành false.
export const MOCK_LOGIN = true
const BASE = import.meta.env.VITE_API_URL ?? ''

export { ApiError }

// Mảng → tham số lặp lại (?category=A&category=B), đúng kiểu list của FastAPI.
type Query = Record<string, string | number | boolean | (string | number)[] | undefined>

function qs(query: Query): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue
    if (Array.isArray(v)) for (const x of v) p.append(k, String(x))
    else p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

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
  // Token giả không bị BE dev kiểm; chỉ đá về /login khi dùng đăng nhập thật.
  if (res.status === 401 && !MOCK_LOGIN && !path.startsWith('/api/auth/')) {
    clearSession()
    window.location.assign('/login')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text || `HTTP ${res.status}`
    try {
      // BE trả {code, message} cho lỗi nghiệp vụ, {detail: [{msg}]} cho lỗi kiểm tra tham số của FastAPI
      const body = JSON.parse(text) as { message?: string; detail?: { msg?: string }[] | string }
      if (body.message) message = body.message
      else if (typeof body.detail === 'string') message = body.detail
      else if (body.detail?.[0]?.msg) message = body.detail[0].msg
    } catch {
      /* giữ nguyên text */
    }
    throw new ApiError(res.status, message)
  }
  return (await res.json()) as T
}

const get = <T>(path: string, query: Query = {}) => http<T>(`/api/${path}${qs(query)}`)

const periodQuery = (p: PeriodParams): Query => ({ month: p.month, from: p.from, to: p.to })
const destQuery = (f: DestinationFilter): Query => ({
  destinationId: f.destinationId,
  unknownDestination: f.unknownDestination,
})

/** locationId = undefined → kho tổng (không gửi location_id). */
export const api = {
  login(email: string, password: string): Promise<LoginResponse> {
    if (MOCK_LOGIN) return mock.login(email, password)
    return http<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    })
  },
  // Chưa có /api/bot/status ở BE: luôn dùng dữ liệu mẫu.
  getBotStatus: (): Promise<BotStatus> => mock.getBotStatus(),
  getLocations: () => get<Location[]>('locations'),

  // ① Hiện tại
  getBelowMin: (locationId?: number) =>
    get<BelowMinKpi>('dashboard/kpis/below-min', { location_id: locationId }),
  getLowStock: (locationId?: number, limit = 5) =>
    get<{ items: LowStockItem[] }>('dashboard/low-stock', { limit, location_id: locationId }),
  getTrackedItems: (locationId?: number, tracked?: boolean) =>
    get<{ items: TrackedItem[] }>('dashboard/tracked-items', { tracked, location_id: locationId }),
  getStockHistory: (itemId: number, locationId?: number, days = 30) =>
    get<StockHistory>(`dashboard/stock/${itemId}/history`, { days, location_id: locationId }),

  // ② Theo ngày
  getStockIn: (range: RangeDays, locationId?: number) =>
    get<CountKpi>('dashboard/kpis/stock-in', { range, location_id: locationId }),
  getStockOut: (range: RangeDays, locationId?: number) =>
    get<CountKpi>('dashboard/kpis/stock-out', { range, location_id: locationId }),
  getInOut: (range: RangeDays, locationId?: number) =>
    get<InOut>('dashboard/in-out', { range, location_id: locationId }),
  getStaff: (range: RangeDays, locationId?: number) =>
    get<{ staff: StaffStat[] }>('dashboard/staff', { range, location_id: locationId }),

  // ③ Bot
  getRegexRate: (weeks: Weeks, locationId?: number) =>
    get<RegexRateKpi>('dashboard/kpis/regex-rate', { weeks, location_id: locationId }),
  getRetype: (weeks: Weeks, locationId?: number) =>
    get<RetypeKpi>('dashboard/kpis/retype', { weeks, location_id: locationId }),
  getParserQuality: (weeks: Weeks, locationId?: number) =>
    get<{ weeks: ParserWeek[] }>('dashboard/parser-quality', { weeks, location_id: locationId }),

  // ④ Hoạt động
  getRecentTransactions: (locationId?: number, limit = 10) =>
    get<{ items: RecentTx[] }>('dashboard/recent-transactions', { limit, location_id: locationId }),

  // ===== Dùng chung nhiều trang (plan mục 8.0) =====
  /** [API-P0] Bộ lọc kỳ: danh sách tháng + kỳ đã chuẩn hóa. */
  getPeriod: (p: PeriodParams) => get<PeriodOptions>('period', { month: p.month, from: p.from, to: p.to }),
  /** [API-C0] Dropdown nhóm hàng; locationIds bỏ trống = mọi mặt hàng. */
  getItemCategories: (locationIds?: number[], noTransactions?: boolean) =>
    get<CategoryCount[]>('items/categories', { locationId: locationIds, noTransactions }),

  // ===== Trang Tồn Kho (kho tổng, plan mục 8.1) =====
  /** [API-S1..S3] Ba thẻ thống kê. Không nhận status: bấm thẻ chỉ để lọc bảng. */
  getStockKpi: (
    kpi: 'total-items' | 'in-stock' | 'variance',
    p: PeriodParams,
    f: { category?: string[]; q?: string } = {},
  ) =>
    get<StockCount>(`stock/kpis/${kpi}`, {
      month: p.month,
      from: p.from,
      to: p.to,
      category: f.category,
      q: f.q,
    }),
  /** [API-S4] Các cột nơi nhận của nhóm cột Xuất. */
  getStockDestinations: (p: PeriodParams) =>
    get<StockDestination[]>('stock/destinations', { month: p.month, from: p.from, to: p.to }),
  /** [API-S5] Bảng chính. */
  getStock: (q: StockQuery) =>
    get<StockResponse>('stock', {
      month: q.month,
      from: q.from,
      to: q.to,
      category: q.category,
      q: q.q,
      status: q.status,
      onlyMoved: q.onlyMoved,
      sort: q.sort,
      order: q.order,
      page: q.page,
      pageSize: q.pageSize,
    }),

  // ===== Trang Danh mục hàng hóa (plan mục 8.4, chỉ đọc) =====
  /** [API-D1] Dropdown "Kho": kho tổng + chi nhánh kèm số mặt hàng, và số mặt hàng chưa có giao dịch. */
  getItemLocations: () => get<ItemLocations>('items/locations'),
  /** [API-D2] Bảng danh mục hàng hóa. */
  getItems: (q: CatalogQuery) =>
    get<CatalogResponse>('items', {
      locationId: q.locationId,
      noTransactions: q.noTransactions,
      category: q.category,
      q: q.q,
      page: q.page,
      pageSize: q.pageSize,
    }),

  // ===== Trang Nhập Kho (kho tổng, plan mục 8.2) =====
  /** [API-I1] Biểu đồ số lượt nhập theo ngày. */
  getInDaily: (p: PeriodParams) =>
    get<InDaily>('transactions/in/daily', { month: p.month, from: p.from, to: p.to }),
  /** [API-I2] Bảng danh sách lượt nhập (type=IN cố định). */
  getInTransactions: (q: InTransactionsQuery) =>
    get<InTransactionsResponse>('transactions', {
      type: 'IN',
      month: q.month,
      from: q.from,
      to: q.to,
      q: q.q,
      page: q.page,
      pageSize: q.pageSize,
    }),

  // ===== Trang Xuất Kho (kho tổng, plan mục 8.3) =====
  /** [API-O1] Dropdown "Nơi nhận": mọi nơi có lượt xuất trong kỳ. */
  getOutDestinations: (p: PeriodParams) =>
    get<OutDestinations>('transactions/out/destinations', { month: p.month, from: p.from, to: p.to }),
  /** [API-O2] Ô (A): tổng lượt xuất theo các nơi nhận đang chọn. */
  getOutTotal: (p: PeriodParams, f: DestinationFilter = {}) =>
    get<OutTotal>('transactions/out/total', { ...periodQuery(p), ...destQuery(f) }),
  /** [API-O3] Bảng (B) Xuất theo nơi nhận. */
  getOutByDestination: (p: PeriodParams, f: DestinationFilter = {}) =>
    get<OutByDestination>('transactions/out/by-destination', { ...periodQuery(p), ...destQuery(f) }),
  /** [API-O4] Biểu đồ (C) xu hướng xuất theo ngày. */
  getOutDaily: (p: PeriodParams, f: DestinationFilter = {}) =>
    get<OutDaily>('transactions/out/daily', { ...periodQuery(p), ...destQuery(f) }),
  /** [API-O5] Khối (D) top mặt hàng được xuất (xếp theo số lượt). */
  getOutTopItems: (p: PeriodParams, f: DestinationFilter = {}, limit = 10) =>
    get<OutTopItems>('transactions/out/top-items', { ...periodQuery(p), ...destQuery(f), limit }),
  /** [API-O6] Bảng (E) danh sách lượt xuất (type=OUT cố định). */
  getOutTransactions: (q: OutTransactionsQuery) =>
    get<OutTransactionsResponse>('transactions', {
      type: 'OUT',
      ...periodQuery(q),
      ...destQuery(q),
      q: q.q,
      page: q.page,
      pageSize: q.pageSize,
    }),
}
