export type RangeDays = 7 | 14 | 30
export type Role = 'staff' | 'manager'
export type ParserSource = 'regex' | 'ner' | 'llm'
export type TxAction = 'IN' | 'OUT' | 'REVERSE'

export interface AdminInfo {
  email: string
  name: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  admin: AdminInfo
}

export interface DailyCount {
  date: string // YYYY-MM-DD
  inCount: number
  outCount: number
}

export interface DashboardKpis {
  inCount: number
  outCount: number
  inDeltaPct: number // so với kỳ trước cùng độ dài
  outDeltaPct: number
  belowMinCount: number
  regexRatePct: number // tuần gần nhất
  regexDeltaPt: number // điểm % so với tuần trước
  retypeRatePct: number // % tin phải gõ lại
  retypeCount: number
}

export interface LowStockItem {
  itemId: string
  name: string
  unit: string
  qty: number
  minQty: number
  avgDailyOut: number
}

export interface ParserWeek {
  weekStart: string // YYYY-MM-DD
  regex: number // phần trăm, 4 số cộng lại = 100
  ner: number
  llm: number
  failed: number
}

export interface StaffStat {
  id: string
  name: string
  role: Role
  messages: number
  syntaxOkPct: number
  undoCount: number
}

export interface RecentTx {
  id: string
  at: string // ISO có múi giờ, ví dụ 2026-10-31T17:12:00+07:00
  action: TxAction
  qty: number
  unit: string
  itemName: string
  staffName: string
  source: ParserSource | 'undo'
  confirmed: boolean // tin do NER/LLM đọc đã được nhân viên trả lời OK
}

export interface BotStatus {
  botName: string
  webhookOk: boolean
  lastMessageAt: string
  queueSize: number
  pendingLabels: number
}

export interface DashboardSummary {
  range: RangeDays
  from: string
  to: string
  kpis: DashboardKpis
  daily: DailyCount[]
  lowStock: LowStockItem[]
  parserWeekly: ParserWeek[]
  staff: StaffStat[]
  recent: RecentTx[]
  pendingLabels: number
}

export interface ItemRef {
  id: string
  name: string
  unit: string
}

export interface StockHistory {
  item: ItemRef
  minQty: number
  points: { date: string; qty: number }[]
}
