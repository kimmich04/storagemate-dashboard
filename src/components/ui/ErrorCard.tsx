import { Icon } from './Icon'

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-critical-bd bg-critical-bg p-4 text-[13px] text-critical-text"
    >
      <span className="flex items-center gap-2">
        <Icon name="alert" size={16} />
        Không tải được dữ liệu: {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-9 rounded-lg border border-critical-bd bg-surface px-3 text-[13px] font-semibold text-critical-text"
      >
        Thử lại
      </button>
    </div>
  )
}
