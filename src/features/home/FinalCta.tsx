import { Link } from 'react-router-dom'
import { LogoMark } from '../../components/brand/LogoMark'
import { ArrowRight } from './HomeChrome'

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-cream">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-pine-2 bg-pine px-6 py-14 text-center sm:px-12 sm:py-16">
          <svg
            aria-hidden="true"
            width="420"
            height="420"
            viewBox="0 0 420 420"
            className="pointer-events-none absolute -top-36 -left-36 text-mustard/[0.07]"
            fill="none"
          >
            <circle cx="210" cy="210" r="200" stroke="currentColor" strokeWidth="48" />
          </svg>
          <svg
            aria-hidden="true"
            width="420"
            height="420"
            viewBox="0 0 420 420"
            className="pointer-events-none absolute -right-36 -bottom-36 text-mustard/[0.07]"
            fill="none"
          >
            <circle cx="210" cy="210" r="200" stroke="currentColor" strokeWidth="48" />
          </svg>

          <div className="relative flex flex-col items-center gap-6">
            <span className="flex size-[72px] items-center justify-center rounded-2xl bg-mustard p-1.5">
              <LogoMark size={60} />
            </span>
            <h2
              id="cta-title"
              className="m-0 max-w-2xl text-4xl leading-[1.05] font-extrabold tracking-[-0.02em] text-cream sm:text-5xl"
            >
              Để quán <span className="text-mustard">hết lục tin nhắn.</span>
            </h2>
            <p className="m-0 max-w-xl text-[15px] leading-relaxed text-sage">
              Tồn kho đúng ngay khi nhắn - và thất thoát hiện ra bằng tiền mỗi tối lúc 21:30,
              không cần họp kiểm kê cuối tháng.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-[54px] items-center gap-2 rounded-full bg-mustard px-7 text-[16px] font-bold text-pine no-underline transition-colors hover:bg-mustard-deep hover:text-pine hover:no-underline"
              >
                Đăng nhập quản trị
                <ArrowRight size={18} />
              </Link>
              <a
                href="#demo"
                className="inline-flex min-h-[54px] items-center rounded-full border border-sage/40 px-7 text-[16px] font-semibold text-cream no-underline transition-colors hover:bg-pine-2 hover:text-cream hover:no-underline"
              >
                Xem lại demo
              </a>
            </div>
            <p className="m-0 text-[11px] text-sage/70">
              Dành cho chủ quán &amp; quản lý chi nhánh · Tài khoản admin do chủ quán tạo
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
