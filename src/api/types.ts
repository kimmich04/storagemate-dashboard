export type RangeDays = 7 | 14 | 30
export type Weeks = 1 | 2 | 3 | 4
export type ParserSource = 'regex' | 'ner' | 'llm' | 'manual' | 'opening' | 'undo'
export type TxAction = 'IN' | 'OUT' | 'WASTE' | 'ADJUST' | 'TRANSFER' | 'PRODUCE'

export interface AdminInfo {
  email: string
  name: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  admin: AdminInfo
}

export interface Location {
  id: number
  code: string
  name: string
}

// ① Hiện tại
export interface BelowMinKpi {
  count: number
}

export interface LowStockItem {
  itemId: number
  name: string
  unit: string
  qty: number
  minQty: number
  avgDailyOut: number
}

export interface TrackedItem {
  id: number
  name: string
  unit: string
  tracked: boolean
}

export interface StockHistory {
  item: { id: number; name: string; unit: string }
  location: { id: number; name: string }
  minQty: number
  points: { date: string; qty: number }[]
}

// ② Theo ngày
export interface CountKpi {
  value: number
  deltaPct: number // so với kỳ trước cùng độ dài; 0 nếu kỳ trước = 0
}

export interface DailyCount {
  date: string // YYYY-MM-DD
  inCount: number
  outCount: number
}

export interface InOut {
  from: string
  to: string
  days: DailyCount[]
}

export interface StaffStat {
  id: number
  name: string
  role: string
  messages: number
  syntaxOkPct: number | null
  undoCount: number
}

// ③ Bot
export interface RegexRateKpi {
  pct: number | null
  deltaPt: number | null
}

export interface RetypeKpi {
  pct: number | null
  count: number
}

export interface ParserWeek {
  weekStart: string // YYYY-MM-DD (thứ Hai)
  regex: number // phần trăm, 4 số cộng lại = 100; tuần trống = 0 và total 0
  ner: number
  llm: number
  failed: number
  total: number
}

// ④ Hoạt động
export interface RecentTx {
  id: number
  at: string // ISO có múi giờ, ví dụ 2026-10-31T17:12:00+07:00
  action: TxAction
  isReversal: boolean
  qty: number
  unit: string
  itemName: string
  staffName: string
  locationName: string
  counterpart: string | null
  source: ParserSource
  confirmed: boolean
}

// ===== Kỳ báo cáo dùng chung: GET /api/period (plan mục 0, 8.0) =====
export interface PeriodParams {
  month?: string // YYYY-MM; bỏ trống = tháng hiện tại
  from?: string // YYYY-MM-DD, ngày bất kỳ trong tháng
  to?: string
}

export interface MonthOption {
  value: string // "2026-10"
  label: string // "Tháng 10/2026"
  hasData: boolean
}

export interface PeriodOptions {
  today: string
  month: string
  months: MonthOption[] // tăng dần, từ 8/2026 đến tháng hiện tại
  from: string
  to: string
  minDate: string // biên chọn ngày: ngày 1 của tháng
  maxDate: string // min(cuối tháng, hôm nay)
}

/** Khối `period` trong phản hồi của các API dữ liệu. */
export interface PeriodRange {
  month: string
  from: string
  to: string
}

// ===== Nhóm hàng: GET /api/items/categories =====
export interface CategoryCount {
  name: string
  count: number
}

// ===== Tồn Kho: /api/stock/* (plan mục 8.1) =====
export interface StockCount {
  count: number
}

export type StockStatus = 'all' | 'in_stock' | 'out_of_stock' | 'variance'
export type StockSortKey = 'name' | 'code' | 'category' | 'closing' | 'variance'
export type SortOrder = 'asc' | 'desc'

export interface StockDestination {
  id: number | null // null = xuất không ghi nơi nhận
  name: string
  kind: 'warehouse' | 'branch' | 'partner' | 'unknown'
}

export interface StockItem {
  itemId: number
  code: string | null
  name: string
  category: string | null
  unit: string // đơn vị gốc
  opening: number
  inbound: number
  outbound: Record<string, number> // "<id nơi nhận>" → số lượng; khóa "null" = chưa rõ nơi nhận
  outboundTotal: number
  waste: number
  variance: number
  other: number
  closing: number
}

export interface StockResponse {
  period: PeriodRange
  total: number
  page: number
  pageSize: number
  items: StockItem[]
}

export interface StockQuery extends PeriodParams {
  category?: string[]
  q?: string
  status?: StockStatus
  onlyMoved?: boolean
  sort?: StockSortKey
  order?: SortOrder
  page?: number
  pageSize?: number
}

// ===== Nhập Kho: /api/transactions (plan mục 8.2) =====
export interface InDay {
  date: string // YYYY-MM-DD
  count: number
}

/** [API-I1] GET /api/transactions/in/daily */
export interface InDaily {
  period: PeriodRange
  days: InDay[] // đủ mọi ngày trong kỳ, ngày trống = 0
}

/** [API-I2] Một lượt nhập; qty theo đơn vị `unit` của chính lượt đó. */
export interface InTransaction {
  id: number
  itemId: number
  code: string | null
  name: string
  unit: string
  qty: number
  eventDate: string
}

export interface InTransactionsResponse {
  period: PeriodRange
  total: number
  page: number
  pageSize: number
  items: InTransaction[]
}

export interface InTransactionsQuery extends PeriodParams {
  q?: string
  page?: number
  pageSize?: number
}

// ===== Xuất Kho: /api/transactions/out/* (plan mục 8.3) =====
/** Bộ lọc nơi nhận. Bỏ trống cả hai = mọi nơi nhận (kể cả chưa rõ). */
export interface DestinationFilter {
  destinationId?: number[]
  unknownDestination?: boolean
}

export interface OutDestinationOption {
  id: number
  name: string
  kind: string // branch | partner | ...
  count: number
}

/** [API-O1] Dropdown "Nơi nhận". */
export interface OutDestinations {
  period: PeriodRange
  destinations: OutDestinationOption[]
  unknown: { count: number } | null
}

/** [API-O2] Ô (A). */
export interface OutTotal {
  count: number
}

export interface OutByDestinationRow {
  id: number
  name: string
  kind: string
  count: number
  itemCount: number
  lastDate: string
}

/** [API-O3] Bảng (B). */
export interface OutByDestination {
  period: PeriodRange
  destinations: OutByDestinationRow[]
  unknown: { count: number; itemCount: number; lastDate: string } | null
}

export interface OutSeries {
  key: string // id nơi nhận | "other" | "unknown"
  name: string
  kind: string // branch | partner | other | unknown
}

export interface OutDay {
  date: string
  total: number
  counts: Record<string, number> // key của series -> số lượt
}

/** [API-O4] Biểu đồ (C). */
export interface OutDaily {
  period: PeriodRange
  series: OutSeries[]
  days: OutDay[]
}

export interface OutTopItem {
  itemId: number
  code: string | null
  name: string
  unit: string // đơn vị gốc
  count: number // số lượt xuất (tiêu chí xếp hạng)
  qtyBase: number // tổng theo đơn vị gốc của chính mặt hàng này
}

/** [API-O5] Khối (D). */
export interface OutTopItems {
  period: PeriodRange
  items: OutTopItem[]
}

/** [API-O6] Một lượt xuất; nơi nhận null = chưa rõ. */
export interface OutTransaction {
  id: number
  itemId: number
  code: string | null
  name: string
  unit: string
  qty: number
  eventDate: string
  destinationId: number | null
  destinationName: string | null
  destinationKind: string | null
}

export interface OutTransactionsResponse {
  period: PeriodRange
  total: number
  page: number
  pageSize: number
  items: OutTransaction[]
}

export interface OutTransactionsQuery extends PeriodParams, DestinationFilter {
  q?: string
  page?: number
  pageSize?: number
}

// ===== Tổng quan: /api/dashboard/* của kho tổng (plan mục 8.5) =====
/** [API-T1..T4] Một ô KPI. deltaPct so với cùng dãy số ngày của tháng liền trước; null = tháng trước bằng 0. */
export interface OverviewKpi {
  value: number
  deltaPct: number | null
}

/** [API-T5] Ô "Còn tồn": số mặt hàng còn tồn đầu kỳ → cuối kỳ, trên tổng số mặt hàng có sổ. */
export interface OverviewInStock {
  opening: number
  closing: number
  total: number
}

/** [API-T6] Biểu đồ cột lượt nhập / xuất theo ngày (đủ mọi ngày trong kỳ). */
export interface OverviewInOut {
  period: PeriodRange
  days: DailyCount[]
}

/** [API-T8] Một giao dịch gần đây (trộn nhập và xuất); không phụ thuộc kỳ. */
export interface OverviewRecentTx {
  id: number
  kind: 'in' | 'out'
  name: string
  unit: string
  qty: number
  eventDate: string
  destinationName: string | null // chỉ có với kind = out và đã rõ nơi nhận
}

// ===== Danh mục hàng hóa: /api/items (plan mục 8.4, giai đoạn chỉ đọc) =====
/** Bộ lọc kho. Bỏ trống cả hai = mọi mặt hàng. */
export interface ItemLocationFilter {
  locationId?: number[]
  noTransactions?: boolean // true = gồm mặt hàng chưa có dòng sổ nào
}

export interface ItemLocationOption {
  id: number
  name: string
  kind: string // warehouse | branch
  itemCount: number
}

/** [API-D1] Dropdown "Kho". */
export interface ItemLocations {
  locations: ItemLocationOption[]
  noTransactionsCount: number
}

export interface ItemUnit {
  name: string
  factor: number // 1 `name` = factor đơn vị gốc
}

export interface CatalogItem {
  id: number
  code: string | null
  name: string
  category: string | null
  unit: string // đơn vị gốc
  minQty: number
  units: ItemUnit[] // quy đổi đóng gói, đã bỏ dòng của chính đơn vị gốc
  matchedAlias: string | null // có khi từ khóa khớp tên gọi khác mà không khớp tên/Mã VT
}

/** [API-D2] Bảng danh mục. */
export interface CatalogResponse {
  total: number
  page: number
  pageSize: number
  items: CatalogItem[]
}

export interface CatalogQuery extends ItemLocationFilter {
  category?: string[]
  q?: string
  page?: number
  pageSize?: number
}

// Chưa có API ở BE: Sidebar vẫn dùng dữ liệu mẫu (xem mocks/api.ts).
export interface BotStatus {
  botName: string
  webhookOk: boolean
  lastMessageAt: string
  queueSize: number
  pendingLabels: number
}
