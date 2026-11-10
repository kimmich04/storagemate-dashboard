import type { ReactNode } from 'react'
import { LogoMark } from '../../components/brand/LogoMark'
import { cn } from '../../lib/cn'

/** Khung cửa sổ chat Zalo - dùng chung cho mock “nhóm kho” và “bot 1:1”. */
export function ChatPanel({
  title,
  subtitle,
  actions,
  label,
  className,
  children,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('overflow-hidden rounded-2xl border border-pine-3/30 bg-zalo-bg', className)}
    >
      <div className="flex items-center gap-3 bg-zalo px-4 py-3">
        <LogoMark size={32} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-bold text-white">{title}</span>
          <span className="truncate text-[10.5px] text-white/85">{subtitle}</span>
        </div>
        {actions && <div className="ml-auto shrink-0">{actions}</div>}
      </div>
      <div className="flex flex-col gap-3.5 p-4 sm:p-5">{children}</div>
    </div>
  )
}

const AVATAR_TONES = ['bg-pine', 'bg-pine-2', 'bg-pine-3'] as const

/** Một dòng tin nhắn trong nhóm: avatar chữ cái + bong bóng + ghi chú nhỏ bên dưới. */
export function GroupMessage({
  initials,
  tone,
  note,
  good,
  children,
}: {
  initials: string
  tone: 0 | 1 | 2
  note?: string
  good?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-cream',
          AVATAR_TONES[tone],
        )}
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <div className="max-w-full rounded-2xl rounded-tl-md border border-line bg-paper px-3.5 py-2 text-[13px] leading-snug text-ink">
          {children}
        </div>
        {note && (
          <span
            className={cn(
              'flex items-center gap-1.5 text-[11px] leading-tight',
              good ? 'font-semibold text-good' : 'font-medium text-accent-ink',
            )}
          >
            {good ? <CheckIcon /> : <WarnIcon />}
            {note}
          </span>
        )}
      </div>
    </div>
  )
}

/** Bong bóng chat 1:1 với bot (tin của nhân viên canh phải, tin của bot canh trái). */
export function BotMessage({ from, children }: { from: 'me' | 'bot'; children: ReactNode }) {
  const mine = from === 'me'
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug text-ink',
        mine
          ? 'self-end rounded-br-md bg-zalo-bubble'
          : 'self-start rounded-bl-md border border-line bg-paper',
      )}
    >
      {children}
    </div>
  )
}

export function WarnIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
