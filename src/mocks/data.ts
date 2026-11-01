import type {
  DailyCount,
  LowStockItem,
  ParserWeek,
  RecentTx,
  StaffStat,
  StockHistory,
} from '../api/types'

/** Mốc cuối của dữ liệu mẫu: 31/10/2026. */
const END = new Date(2026, 9, 31)
const TOTAL_DAYS = 60
const HISTORY_DAYS = 30

/** Số giả ngẫu nhiên xác định: cùng (i, k) luôn ra cùng kết quả. */
function rnd(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function dayAt(i: number, total: number): Date {
  return new Date(END.getFullYear(), END.getMonth(), END.getDate() - (total - 1 - i))
}

export const DAILY: DailyCount[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const d = dayAt(i, TOTAL_DAYS)
  const weekend = d.getDay() === 0 || d.getDay() === 6
  return {
    date: iso(d),
    inCount: 2 + Math.floor(rnd(i, 1) * 4),
    outCount: (weekend ? 14 : 8) + Math.floor(rnd(i, 2) * (weekend ? 8 : 7)),
  }
})

interface ItemSeed {
  id: string
  name: string
  unit: string
  minQty: number
  start: number
  lo: number
  hi: number
  restock: Record<number, number>
  tracked: boolean
}

const ITEM_SEEDS: ItemSeed[] = [
  { id: 'botmi', name: 'Bột mì', unit: 'kg', minQty: 20, start: 70, lo: 4, hi: 7, restock: { 6: 50, 16: 50, 25: 45 }, tracked: true },
  { id: 'sua', name: 'Sữa tươi', unit: 'hộp', minQty: 48, start: 200, lo: 18, hi: 30, restock: { 4: 144, 11: 144, 18: 144, 26: 120 }, tracked: true },
  { id: 'duong', name: 'Đường', unit: 'kg', minQty: 10, start: 30, lo: 1, hi: 2.2, restock: { 14: 20 }, tracked: true },
  { id: 'bo', name: 'Bơ lạt', unit: 'kg', minQty: 5, start: 14, lo: 0.5, hi: 1.2, restock: { 9: 10, 21: 5 }, tracked: true },
  { id: 'trung', name: 'Trứng', unit: 'quả', minQty: 60, start: 420, lo: 25, hi: 40, restock: { 5: 240, 13: 240, 21: 240 }, tracked: false },
  { id: 'cafe', name: 'Cà phê hạt', unit: 'kg', minQty: 3, start: 12, lo: 0.4, hi: 0.7, restock: { 12: 6 }, tracked: false },
]

interface ItemSeries extends ItemSeed {
  values: number[]
  avgDailyOut: number
}

export const ITEMS: ItemSeries[] = ITEM_SEEDS.map((seed, k) => {
  let stock = seed.start
  let used = 0
  const values: number[] = []
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const out = seed.lo + rnd(i, 10 + k) * (seed.hi - seed.lo)
    used += out
    stock = Math.max(0, stock - out + (seed.restock[i] ?? 0))
    values.push(Math.round(stock * 10) / 10)
  }
  return { ...seed, values, avgDailyOut: used / HISTORY_DAYS }
})

export function stockHistory(itemId: string): StockHistory | undefined {
  const it = ITEMS.find((x) => x.id === itemId)
  if (!it) return undefined
  return {
    item: { id: it.id, name: it.name, unit: it.unit },
    minQty: it.minQty,
    points: it.values.map((qty, i) => ({ date: iso(dayAt(i, HISTORY_DAYS)), qty })),
  }
}

export function lowStock(limit = 5): LowStockItem[] {
  return ITEMS.map((it) => ({
    itemId: it.id,
    name: it.name,
    unit: it.unit,
    qty: it.values[it.values.length - 1],
    minQty: it.minQty,
    avgDailyOut: it.avgDailyOut,
  }))
    .sort((a, b) => a.qty / a.minQty - b.qty / b.minQty)
    .slice(0, limit)
}

export function belowMinCount(): number {
  return ITEMS.filter((it) => it.values[it.values.length - 1] < it.minQty).length
}

export const PARSER_WEEKS: ParserWeek[] = [
  { weekStart: '2026-10-06', regex: 72, ner: 10, llm: 12, failed: 6 },
  { weekStart: '2026-10-13', regex: 76, ner: 11, llm: 9, failed: 4 },
  { weekStart: '2026-10-20', regex: 80, ner: 10, llm: 7, failed: 3 },
  { weekStart: '2026-10-27', regex: 83, ner: 9, llm: 6, failed: 2 },
]

export const STAFF: StaffStat[] = [
  { id: 's1', name: 'Lan', role: 'staff', messages: 86, syntaxOkPct: 94, undoCount: 1 },
  { id: 's2', name: 'Minh', role: 'staff', messages: 74, syntaxOkPct: 88, undoCount: 3 },
  { id: 's3', name: 'Hòa', role: 'manager', messages: 41, syntaxOkPct: 97, undoCount: 0 },
  { id: 's4', name: 'Tuấn', role: 'staff', messages: 63, syntaxOkPct: 71, undoCount: 5 },
  { id: 's5', name: 'Vy', role: 'staff', messages: 29, syntaxOkPct: 90, undoCount: 1 },
]

export const RECENT: RecentTx[] = [
  { id: 't6', at: '2026-10-31T17:12:00+07:00', action: 'OUT', qty: 3, unit: 'thùng', itemName: 'sữa tươi', staffName: 'Lan', source: 'regex', confirmed: true },
  { id: 't5', at: '2026-10-31T16:48:00+07:00', action: 'IN', qty: 50, unit: 'kg', itemName: 'bột mì', staffName: 'Minh', source: 'regex', confirmed: true },
  { id: 't4', at: '2026-10-31T16:05:00+07:00', action: 'OUT', qty: 2, unit: 'kg', itemName: 'đường', staffName: 'Tuấn', source: 'llm', confirmed: true },
  { id: 't3', at: '2026-10-31T15:40:00+07:00', action: 'REVERSE', qty: 1, unit: 'kg', itemName: 'bơ lạt', staffName: 'Tuấn', source: 'undo', confirmed: true },
  { id: 't2', at: '2026-10-31T14:22:00+07:00', action: 'OUT', qty: 30, unit: 'quả', itemName: 'trứng', staffName: 'Vy', source: 'ner', confirmed: true },
  { id: 't1', at: '2026-10-31T13:10:00+07:00', action: 'IN', qty: 6, unit: 'kg', itemName: 'cà phê hạt', staffName: 'Hòa', source: 'regex', confirmed: true },
]

export const PENDING_LABELS = 14
