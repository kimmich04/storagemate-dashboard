import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { cn } from '../../lib/cn'
import { useAsync } from '../../lib/useAsync'
import { NAV_ITEMS } from './nav'

function minutesAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (!Number.isFinite(diff) || diff < 0 || diff > 60 * 24) return iso.slice(11, 16)
  return diff <= 1 ? 'vừa xong' : `${diff} phút trước`
}

export function Sidebar() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const bot = useAsync(() => api.getBotStatus(), [])

  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex max-w-full min-w-0 flex-[1_1_220px] flex-col gap-6 border-r border-line bg-surface px-4 py-6"
    >
      <div className="flex flex-col gap-0.5 px-2">
        <span className="text-[17px] font-bold tracking-[-0.01em]">Storagemate</span>
        <span className="text-xs text-muted">Quán Mộc · kho trung tâm</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-lg px-3 py-[9px] no-underline hover:no-underline',
                isActive
                  ? 'bg-nav-active-bg font-semibold text-nav-active-fg hover:text-nav-active-fg'
                  : 'text-ink-2 hover:bg-chip hover:text-ink',
              )
            }
          >
            <span>{item.label}</span>
            {item.badgeKey && bot.data && bot.data.pendingLabels > 0 && (
              <span className="rounded-full bg-chip px-2 py-px text-xs font-semibold text-ink-2">
                {bot.data.pendingLabels}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-line p-3.5">
          <span className="text-xs text-muted">Zalo Bot · {bot.data?.botName ?? '…'}</span>
          <span className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className={cn('size-2 rounded-full', bot.data?.webhookOk === false ? 'bg-critical' : 'bg-good')}
            />
            {bot.data?.webhookOk === false ? 'Webhook lỗi' : 'Webhook hoạt động'}
          </span>
          <span className="text-xs text-muted">
            {bot.data
              ? `Tin cuối: ${minutesAgo(bot.data.lastMessageAt)} · Hàng đợi: ${bot.data.queueSize} tin`
              : 'Đang kiểm tra…'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 text-xs">
          <span className="min-w-0 truncate text-muted">{admin?.email}</span>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="shrink-0 whitespace-nowrap rounded-md border-0 bg-transparent px-1 py-1 font-semibold text-link hover:text-link-hover hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  )
}
