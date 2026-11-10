import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark, Wordmark } from '../../components/brand/LogoMark'
import { cn } from '../../lib/cn'

const TICKER_ITEMS = [
  'Nhắn Zalo là xong kiểm kho',
  'Tồn kho tức thời',
  'Đối soát iPOS mỗi tối',
  'Báo cáo 21:30 qua Zalo',
] as const

const HOME_NAV = [
  { href: '#van-de', label: 'Vấn đề' },
  { href: '#ai', label: 'Tính năng' },
  { href: '#cach-hoat-dong', label: 'Cách hoạt động' },
  { href: '#demo', label: 'Demo' },
  { href: '#vi-sao', label: 'So sánh' },
] as const

export function ArrowRight({ size = 16 }: { size?: number }) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function ArrowDown({ size = 16 }: { size?: number }) {
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
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  )
}

function Asterisk() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-mustard-deep">
      <path
        d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TopTicker() {
  const row = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div
      aria-label="Điểm nhanh của Storagemate"
      className="flex h-9 items-center overflow-hidden border-b border-line bg-paper"
    >
      <div className="marquee-track flex items-center gap-6 whitespace-nowrap" aria-hidden="true">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 text-[11px] font-semibold tracking-wide text-pine"
          >
            {item}
            <Asterisk />
          </span>
        ))}
      </div>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40">
      <TopTicker />
      <header className="border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label="Storagemate - về trang chủ"
            className="flex items-center gap-2.5 no-underline hover:no-underline"
          >
            <LogoMark size={36} />
            <span className="flex flex-col gap-0.5">
              <Wordmark />
              <span className="text-[8.5px] font-bold tracking-[0.22em] text-pine-3 uppercase">
                F&amp;B Inventory Bot
              </span>
            </span>
          </Link>

          <nav aria-label="Điều hướng trang" className="hidden items-center gap-6 lg:flex">
            {HOME_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold text-ink-2 no-underline hover:text-pine hover:no-underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden min-h-[44px] items-center gap-2 rounded-full bg-mustard px-5 text-[13px] font-bold text-pine no-underline transition-colors hover:bg-mustard-deep hover:text-pine hover:no-underline sm:inline-flex"
            >
              Đăng nhập
              <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={open}
              aria-controls="home-mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="flex size-11 items-center justify-center rounded-full border border-line-strong bg-paper text-pine lg:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div id="home-mobile-nav" className="border-t border-line bg-paper lg:hidden">
            <nav
              aria-label="Điều hướng trang (mobile)"
              className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-3 sm:px-6"
            >
              {HOME_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink-2 no-underline hover:bg-mustard-soft hover:no-underline"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-mustard px-4 text-[15px] font-bold text-pine no-underline hover:bg-mustard-deep hover:text-pine hover:no-underline"
              >
                Đăng nhập quản trị
                <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        )}
      </header>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-pine text-sage">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="flex items-center gap-2.5">
              <LogoMark size={40} />
              <Wordmark tone="light" />
            </span>
            <p className="m-0 text-[13px] leading-relaxed text-sage">
              AI agent trên Zalo ghi nhập/xuất kho và tự đối soát với bán hàng cho chuỗi F&amp;B.
            </p>
            <p className="m-0 text-[13px] font-bold text-mustard">Nhắn Zalo là xong kiểm kho.</p>
          </div>

          <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-12 text-[13px]">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-mustard uppercase">
                Sản phẩm
              </span>
              <a href="#demo" className={footerLink}>
                Xem demo một lần xuất hàng
              </a>
              <a href="#cach-hoat-dong" className={footerLink}>
                Cách hoạt động
              </a>
              <a href="#vi-sao" className={footerLink}>
                Vì sao Storagemate
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-mustard uppercase">
                Tài khoản
              </span>
              <Link to="/login" className={footerLink}>
                Đăng nhập quản trị
              </Link>
            </div>
          </nav>
        </div>

        <div
          className={cn(
            'mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2',
            'border-t border-white/10 pt-5 text-[11px] text-sage/80',
          )}
        >
          <span>© 2026 Storagemate</span>
          <span>F&amp;B Inventory Bot</span>
          <span>Nhắn Zalo là xong kiểm kho.</span>
        </div>
      </div>
    </footer>
  )
}

const footerLink = 'text-sage no-underline hover:text-cream hover:underline'
