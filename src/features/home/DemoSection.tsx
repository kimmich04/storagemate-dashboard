import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChatPanel, BotMessage, CheckIcon } from './ZaloChat'
import { SectionHeading } from './SectionHeading'
import { ArrowRight } from './HomeChrome'

interface DemoMessage {
  from: 'me' | 'bot'
  content: ReactNode
}

const MESSAGES: DemoMessage[] = [
  { from: 'me', content: 'xuat 2 bo phin nhom xanh' },
  { from: 'bot', content: 'Bộ phin nhôm màu nào? 1 xanh đậm · 2 xanh nhạt · 3 xanh lá' },
  { from: 'me', content: '2' },
  {
    from: 'bot',
    content: (
      <>
        Mình hiểu: <strong>XUẤT 2 Bộ phin nhôm xanh nhạt</strong>, 14:05 hôm nay. Đúng thì trả lời
        OK.
      </>
    ),
  },
  { from: 'me', content: 'ok' },
  {
    from: 'bot',
    content: (
      <span className="flex items-center gap-1.5">
        <CheckIcon size={14} />
        <span>
          Đã ghi. Tồn còn: <strong>6 bộ</strong>.
        </span>
      </span>
    ),
  },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function DemoSection() {
  // Mặc định hiện đủ hội thoại (nội dung đọc được ngay); nút "Phát lại" mới chạy lại từng tin.
  const [step, setStep] = useState(MESSAGES.length)

  useEffect(() => {
    if (step >= MESSAGES.length) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 450 : 850)
    return () => clearTimeout(t)
  }, [step])

  const done = step >= MESSAGES.length

  return (
    <section
      id="demo"
      aria-labelledby="demo-title"
      className="scroll-mt-28 bg-pine"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          headingId="demo-title"
          tone="light"
          eyebrow="Demo"
          title="Demo: một lần xuất hàng."
          sub="Từ tin nhắn lộn xộn tới sổ kho đúng và báo cáo 21:30 - xem thử bên phải là báo cáo cuối ngày."
        />

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-3">
            <ChatPanel
              label="Hội thoại mẫu giữa nhân viên và Bot Storagemate"
              title="Bot Storagemate"
              subtitle="Zalo 1:1 · trả lời tự động"
              actions={
                <button
                  type="button"
                  onClick={() => setStep(prefersReducedMotion() ? MESSAGES.length : 0)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 2.6-6.4" />
                    <path d="M3 4v5h5" />
                  </svg>
                  Phát lại
                </button>
              }
            >
              <div className="flex flex-col gap-3" aria-live="polite">
                {MESSAGES.slice(0, step).map((m, i) => (
                  <BotMessage key={i} from={m.from}>
                    {m.content}
                  </BotMessage>
                ))}
                {!done && (
                  <div
                    aria-hidden="true"
                    className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3"
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 animate-pulse rounded-full bg-faint"
                        style={{ animationDelay: `${d * 180}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ChatPanel>
            <p className="m-0 text-center text-[11px] text-sage/80">
              Hội thoại và báo cáo minh hoạ.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-pine-3 bg-paper p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 text-[15px] font-bold text-pine">
                Báo cáo 21:30 · Chi nhánh TP.HCM
              </h3>
              <span className="rounded-full bg-mustard px-2.5 py-1 text-[11px] font-semibold text-pine">
                Tự động gửi
              </span>
            </div>

            <div className="flex flex-col gap-1 border-y border-line py-4">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                Chênh lệch hôm nay
              </span>
              <span className="text-[40px] leading-none font-extrabold tracking-[-0.02em] text-pine tabular-nums">
                ≈ 1.198.000 đ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] text-muted">
                    <th scope="col" className="border-b border-line py-2 pr-2 font-medium">
                      Mặt hàng
                    </th>
                    <th scope="col" className="border-b border-line py-2 px-2 text-right font-medium">
                      Bán
                    </th>
                    <th scope="col" className="border-b border-line py-2 px-2 text-right font-medium">
                      Xuất
                    </th>
                    <th scope="col" className="border-b border-line py-2 pl-2 font-medium">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className="border-b border-line-soft py-2.5 pr-2 font-semibold">
                      Set phin sứ 599k
                    </td>
                    <td className="border-b border-line-soft py-2.5 px-2 text-right tabular-nums">3</td>
                    <td className="border-b border-line-soft py-2.5 px-2 text-right tabular-nums">1</td>
                    <td className="border-b border-line-soft py-2.5 pl-2">
                      <span className="inline-flex rounded-full bg-critical-bg px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-critical-text">
                        Thiếu 2 tin
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-line-soft py-2.5 pr-2 font-semibold">
                      Bộ phin nhôm xanh nhạt
                    </td>
                    <td className="border-b border-line-soft py-2.5 px-2 text-right tabular-nums">2</td>
                    <td className="border-b border-line-soft py-2.5 px-2 text-right tabular-nums">2</td>
                    <td className="border-b border-line-soft py-2.5 pl-2">
                      <span className="inline-flex rounded-full bg-good/10 px-2 py-0.5 text-[11px] font-semibold text-good">
                        Khớp
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-2 font-semibold">Túi tote Sunshine</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">4</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">4</td>
                    <td className="py-2.5 pl-2">
                      <span className="inline-flex rounded-full bg-good/10 px-2 py-0.5 text-[11px] font-semibold text-good">
                        Khớp
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="m-0 text-[11px] text-faint">
              Bán = báo cáo iPOS · Xuất = tin Zalo · Số liệu minh hoạ
            </p>
            <Link
              to="/login"
              className="inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-pine no-underline hover:text-pine-2 hover:underline"
            >
              Mở dashboard thật với dữ liệu mẫu
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
