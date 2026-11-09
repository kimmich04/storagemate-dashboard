import type { ReactNode } from 'react'
import { CheckIcon } from './ZaloChat'
import { SectionHeading } from './SectionHeading'

interface AiCard {
  title: string
  icon: ReactNode
  convo: ReactNode
  foot: string
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const CARDS: AiCard[] = [
  {
    title: 'Hiểu tin gõ sai',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <path d="M4 6h16M4 12h9M4 18h6" />
        <path d="m17.5 14.5 4 4M21.5 14.5l-4 4" />
      </svg>
    ),
    convo: (
      <>
        <div className="self-end rounded-2xl rounded-br-md bg-zalo-bubble px-3 py-2 text-[13px] text-ink">
          xuat 2 phin nhom xanh
        </div>
        <div className="self-start rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 text-[13px] text-ink">
          Xanh đậm, xanh nhạt hay xanh lá?
        </div>
      </>
    ),
    foot: 'Model NER tiếng Việt tự train + LLM dự phòng',
  },
  {
    title: 'Đối soát với iPOS',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        <path d="M8 12h8" />
        <path d="m11 9 3 3-3 3" />
      </svg>
    ),
    convo: (
      <>
        <div className="self-end rounded-2xl rounded-br-md bg-zalo-bubble px-3 py-2 text-[13px] text-ink">
          iPOS bán 3 · Zalo ghi xuất 1
        </div>
        <div className="flex flex-col gap-1 self-start rounded-2xl rounded-bl-md border border-accent-soft bg-accent-soft/15 px-3 py-2 text-[13px] font-semibold text-accent-ink">
          <span className="flex items-center gap-1.5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            Set phin sứ: thiếu 2 tin xuất
          </span>
        </div>
      </>
    ),
    foot: 'So khớp báo cáo bán với sổ kho mỗi tối',
  },
  {
    title: 'Trả lời quản lý',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 21l1.7-5.1A8.3 8.3 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
        <path d="M9 11.5h6M9 8.5h3.5" />
      </svg>
    ),
    convo: (
      <>
        <div className="self-end rounded-2xl rounded-br-md bg-zalo-bubble px-3 py-2 text-[13px] text-ink">
          Túi tote Sunshine còn mấy cái?
        </div>
        <div className="self-start rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 text-[13px] text-ink">
          Còn 12 cái. Tuần này xuất 8.
        </div>
      </>
    ),
    foot: 'LLM hỏi đáp tiếng Việt trên dữ liệu chỉ-đọc',
  },
]

export function AiSection() {
  return (
    <section
      id="ai"
      aria-labelledby="ai-title"
      className="scroll-mt-28 border-b border-line bg-paper"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          headingId="ai-title"
          eyebrow="Tính năng AI"
          title="AI làm 3 việc quản lý đang làm tay."
          sub="Không thay người ra quyết định - AI đọc tin, đối soát sổ, trả lời câu hỏi; quản lý vẫn là người xác nhận cuối cùng."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-pine-3/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mustard text-pine">
                  {card.icon}
                </span>
                <h3 className="m-0 text-[17px] font-bold text-pine">{card.title}</h3>
              </div>
              <div className="flex min-h-[118px] flex-col justify-center gap-2 rounded-xl bg-zalo-bg p-3">
                {card.convo}
              </div>
              <p className="m-0 mt-auto border-t border-line-soft pt-3 text-[12px] leading-snug text-muted">
                {card.foot}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-pine px-6 py-5 text-cream sm:flex-row sm:gap-6">
          <p className="m-0 flex items-center gap-3 text-[14px] leading-snug">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-2 text-mustard">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-2.6-6.4" />
                <path d="M21 3v6h-6" />
              </svg>
            </span>
            <span>
              <strong className="text-cream">Vòng lặp dữ liệu:</strong> người xác nhận OK → dữ liệu
              sạch dần → model học lại mỗi tuần.
            </span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sage/40 px-3 py-1.5 text-[11px] font-semibold text-sage">
            <CheckIcon size={12} />
            Càng dùng càng đúng
          </span>
        </div>
      </div>
    </section>
  )
}
