import { useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { ApiError, USE_MOCK } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Icon } from '../components/ui/Icon'
import { cn } from '../lib/cn'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../mocks/api'

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const e: FieldErrors = {}
  if (!email.trim()) e.email = 'Nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email chưa đúng định dạng.'
  if (!password) e.password = 'Nhập mật khẩu.'
  else if (password.length < 8) e.password = 'Mật khẩu có ít nhất 8 ký tự.'
  return e
}

const inputCls =
  'h-11 w-full rounded-[10px] border bg-surface px-3 text-sm text-ink outline-none placeholder:text-faint focus:border-series-in focus:ring-2 focus:ring-series-in/25'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const emailId = useId()
  const pwId = useId()

  if (isAuthenticated) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v = validate(email, password)
    setErrors(v)
    setFormError(null)
    if (v.email || v.password) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError && err.status === 401
          ? 'Sai email hoặc mật khẩu.'
          : 'Không kết nối được máy chủ. Thử lại sau.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground p-4 font-sans text-sm text-ink">
      <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl border border-line bg-surface p-8">
        <Link
          to="/"
          className="-mt-2 flex w-fit flex-col gap-0.5 no-underline hover:no-underline"
          aria-label="Về trang giới thiệu Storagemate"
        >
          <span className="text-[17px] font-bold tracking-[-0.01em]">Storagemate</span>
          <span className="text-xs text-muted">Quán Mộc · kho trung tâm</span>
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em]">Đăng nhập quản trị</h1>
          <p className="m-0 text-muted">Dùng tài khoản admin do chủ quán tạo.</p>
        </div>

        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[10px] border border-critical-bd bg-critical-bg px-3 py-2.5 text-[13px] text-critical-text"
            >
              <Icon name="alert" size={16} />
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-[13px] font-medium text-ink-2">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="username"
              placeholder="admin@quan.vn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((x) => ({ ...x, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-err` : undefined}
              className={cn(inputCls, errors.email ? 'border-critical' : 'border-line-strong')}
            />
            {errors.email && (
              <span id={`${emailId}-err`} className="text-xs text-critical-text">
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={pwId} className="text-[13px] font-medium text-ink-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id={pwId}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }))
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? `${pwId}-err` : undefined}
                className={cn(inputCls, 'pr-16', errors.password ? 'border-critical' : 'border-line-strong')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-pressed={showPw}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute inset-y-1 right-1 flex items-center gap-1 rounded-lg border-0 bg-transparent px-2.5 text-xs font-semibold text-link hover:bg-chip"
              >
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.password && (
              <span id={`${pwId}-err`} className="text-xs text-critical-text">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 h-11 w-full rounded-[10px] border-0 bg-primary text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        {USE_MOCK && (
          <p className="m-0 text-xs text-faint">
            Bản demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        )}
      </div>
    </div>
  )
}
