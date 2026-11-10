import { Link } from 'react-router-dom'
import { ArrowRight } from './HomeChrome'

function ArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function Stars({ size = 13 }: { size?: number }) {
  return (
    <span className="flex items-center gap-0.5 text-mustard-deep" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.8 1.4 6.9L12 17.2 5.9 20.8l1.4-6.9L2.2 9.1l6.9-.8L12 2z" />
        </svg>
      ))}
    </span>
  )
}

const AVATARS = [
  { initials: 'L', bg: 'bg-pine text-cream' },
  { initials: 'M', bg: 'bg-mustard text-pine' },
  { initials: 'H', bg: 'bg-pine-2 text-cream' },
  { initials: 'T', bg: 'bg-mustard-deep text-pine' },
  { initials: 'V', bg: 'bg-pine-3 text-cream' },
]

function AvatarStack() {
  return (
    <span className="flex -space-x-2.5" aria-hidden="true">
      {AVATARS.map((a, i) => (
        <span
          key={i}
          className={`flex size-9 items-center justify-center rounded-full border-2 border-cream text-[12px] font-bold ${a.bg}`}
        >
          {a.initials}
        </span>
      ))}
    </span>
  )
}

function CircularBadge() {
  return (
    <div
      aria-hidden="true"
      className="spin-slow absolute -left-3 top-10 z-10 hidden size-[104px] sm:block lg:-left-8"
    >
      <svg viewBox="0 0 104 104" className="size-full">
        <circle cx="52" cy="52" r="52" fill="var(--color-pine)" />
        <defs>
          <path id="badge-circle" d="M52,52 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
        </defs>
        <text className="fill-mustard text-[10.5px] font-bold uppercase" letterSpacing="2.2">
          <textPath href="#badge-circle">
            Tồn kho tức thời · Nhắn Zalo là xong · Tồn kho tức thời · Nhắn Zalo là xong ·
          </textPath>
        </text>
        <path
          d="M52 36l4.6 9.9 10.9 1-8.1 7.5 2.2 10.8L52 61l-9.6 5.2 2.2-10.8-8.1-7.5 10.9-1L52 36z"
          fill="var(--color-mustard)"
        />
      </svg>
    </div>
  )
}

function ReportFloat() {
  return (
    <div className="w-[236px] rounded-2xl border border-line bg-paper px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-pine">Báo cáo 21:30 · CN TP.HCM</span>
        <span aria-hidden="true" className="size-2 rounded-full bg-good" />
      </div>
      <p className="m-0 mt-1.5 text-[10px] font-medium tracking-wide text-faint uppercase">
        Chênh lệch hôm nay
      </p>
      <p className="m-0 text-[22px] leading-tight font-extrabold tracking-[-0.01em] text-pine tabular-nums">
        ≈ 1.198.000 đ
      </p>
      <p className="m-0 mt-1 text-[11px] text-muted">Set phin sứ 599k: thiếu 2 tin xuất</p>
    </div>
  )
}

function LeafArt({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 520"
      fill="none"
      className={`pointer-events-none absolute text-pine opacity-[0.10] ${className}`}
    >
      <path
        d="M110 500C60 380 150 300 90 180 60 120 80 60 130 10"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M100 420c-30-8-48-32-52-62 30 4 50 22 58 48M96 340c-32-4-52-28-56-58 32 2 52 20 62 44M100 250c-30-10-44-36-44-66 28 6 46 26 54 52M112 150c-22-14-28-40-22-66 22 10 34 30 38 54"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M118 380c28-12 40-38 38-68-28 8-44 28-50 54M120 270c28-8 44-34 42-64-28 6-44 26-50 50M126 170c24-12 32-36 28-62-22 8-34 26-38 50"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

const INTEGRATIONS = [
  {
    name: 'iPOS',
    note: 'đối soát bán hàng',
    icon: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </>
    ),
  },
  {
    name: 'Zalo',
    note: 'nhắn tin & báo cáo',
    icon: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 20l1.7-5.3A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
      </>
    ),
  },
  {
    name: 'Excel',
    note: 'báo cáo bán hàng',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9.5h18M9.5 4v16M15 4v16" />
      </>
    ),
  },
  {
    name: 'QR 1 chạm',
    note: 'nhân viên quét là dùng',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M21 14v.01M14 21v.01M21 21v-4M17.5 17.5h.01" />
      </>
    ),
  },
]

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-cream">
      <LeafArt className="top-16 -left-10 hidden h-[480px] lg:block" />
      <LeafArt className="top-40 -right-10 hidden h-[480px] rotate-12 lg:block" />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-14 lg:pb-16">
        <div className="flex flex-col items-start gap-6 lg:col-span-6">
          <span className="flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] text-pine uppercase">
            <span aria-hidden="true" className="h-px w-6 bg-pine" />
            F&amp;B Inventory Bot
            <span aria-hidden="true" className="h-px w-6 bg-pine" />
          </span>

          <h1
            id="hero-title"
            className="m-0 text-[46px] leading-[1.02] font-extrabold tracking-[-0.03em] text-ink sm:text-[62px]"
          >
            Nhắn Zalo là
            <br />
            <span className="relative inline-block whitespace-nowrap">
              <span
                aria-hidden="true"
                className="absolute -inset-x-2 bottom-1 -z-0 h-[42%] -rotate-[0.8deg] rounded-[6px] bg-mustard"
              />
              <span className="relative">xong kiểm kho.</span>
            </span>
          </h1>

          <p className="m-0 max-w-[440px] text-[16px] leading-relaxed text-ink-2">
            AI agent trên Zalo ghi nhập/xuất kho và tự đối soát với bán hàng cho chuỗi F&amp;B -
            tồn kho đúng ngay khi nhân viên nhắn, không cài thêm app.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-pine px-6 text-[15px] font-bold text-cream no-underline transition-colors hover:bg-pine-2 hover:text-cream hover:no-underline"
            >
              Đăng nhập quản trị
              <ArrowRight size={17} />
            </Link>
            <a
              href="#demo"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-pine bg-paper px-6 text-[15px] font-bold text-pine no-underline transition-colors hover:bg-mustard-soft hover:no-underline"
            >
              Xem demo
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <AvatarStack />
            <div className="flex flex-col">
              <Stars />
              <span className="text-[11px] text-muted">
                <strong className="text-ink">83%</strong> tin kho hiểu ngay ·{' '}
                <strong className="text-ink">2%</strong> phải gõ lại
              </span>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[104%] w-[96%] -translate-x-1/2 rounded-t-[999px] bg-mustard"
          />
          <CircularBadge />
          <figure className="relative m-0 mt-16 overflow-hidden rounded-[2rem] border border-pine/15 bg-paper">
            <img
              src="/brand/storagemate-cover.jpeg"
              alt="Minh hoạ robot Storagemate đẩy xe hàng tươi trong kho F&B, bên cạnh màn hình giám sát tồn kho"
              width={1376}
              height={768}
              className="block h-auto w-full"
            />
          </figure>
          <div className="absolute -bottom-4 left-3 hidden sm:block lg:-left-4">
            <ReportFloat />
          </div>
          <div className="mt-4 sm:hidden">
            <ReportFloat />
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
          <span className="text-[10px] font-bold tracking-[0.2em] text-faint uppercase">
            Quán đã có, chỉ cần thêm QR
          </span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {INTEGRATIONS.map((tool) => (
              <span key={tool.name} className="flex items-center gap-2 text-pine/70">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {tool.icon}
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-[15px] font-extrabold tracking-tight">{tool.name}</span>
                  <span className="mt-0.5 text-[9.5px] text-muted">{tool.note}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
