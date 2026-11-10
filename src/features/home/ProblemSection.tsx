import { ChatPanel, GroupMessage, WarnIcon } from './ZaloChat'
import { SectionHeading } from './SectionHeading'

const PAINS = [
  'Tồn kho thật chỉ biết vào cuối tháng',
  'Không biết ai ghi sai',
  'Tin quên gửi = hàng mất dấu',
] as const

const FAILURE_MODES = [
  {
    title: 'Sai cú pháp',
    desc: '8 trường thông tin, 89 mã hàng gần giống nhau theo màu và size',
  },
  {
    title: 'Quên nhắn',
    desc: 'Không ai biết tin nào chưa gửi cho tới lúc kiểm kê',
  },
  {
    title: 'Không biết tồn',
    desc: 'Số tồn chỉ có sau một ngày tổng hợp cuối tháng',
  },
] as const

export function ProblemSection() {
  return (
    <section id="van-de" aria-labelledby="van-de-title" className="scroll-mt-20 bg-cream">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-3">
            <ChatPanel
              label="Ví dụ tin nhắn trong nhóm kho trước khi có Storagemate"
              title="Nhóm Kho · Chi nhánh TP.HCM"
              subtitle="4 tin nhắn · sáng nay"
            >
              <GroupMessage initials="M" tone={0} note="Xanh đậm, xanh nhạt hay xanh lá?">
                xuat 2 phin nhom xanh
              </GroupMessage>
              <GroupMessage initials="T" tone={1} note="Ảnh không kèm nội dung">
                <span className="inline-flex items-center gap-2 text-muted">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="1.6" />
                    <path d="m4 18 6-6 5 5 3-3 6 6" />
                  </svg>
                  [Hình ảnh]
                </span>
              </GroupMessage>
              <GroupMessage initials="L" tone={2} note="Thiếu số lượng và size">
                Xuất áo phông đen 9h
              </GroupMessage>
              <GroupMessage initials="M" tone={0} good note="Đúng cú pháp">
                Nhập 40 thanh Eggpresso Robusta 8h 1/11
              </GroupMessage>
            </ChatPanel>
            <p className="m-0 text-center text-[11px] text-pine-3">
              Tin nhắn thật trong nhóm kho - mỗi tháng quản lý phải lục lại từng dòng rồi nhập tay
              vào Excel.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeading
              headingId="van-de-title"
              eyebrow="Vấn đề"
              title={<>Kiểm kho bằng cách lục tin nhắn</>}
              sub="Quán đã dùng iPOS để bán hàng, nhưng nhân viên vẫn ghi kho qua Zalo - vì nhắn trên điện thoại nhanh hơn mở app."
            />

            <div className="flex flex-wrap items-end gap-4 border-y border-line py-5">
              <span className="text-6xl leading-none font-extrabold tracking-[-0.03em] text-pine tabular-nums">
                1 ngày
              </span>
              <p className="m-0 max-w-[280px] text-[15px] leading-snug text-ink-2">
                công <strong>mỗi tháng, mỗi quán</strong> - để quản lý lục lại lịch sử Zalo rồi
                nhập tay vào Excel.
              </p>
            </div>

            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {PAINS.map((pain) => (
                <li
                  key={pain}
                  className="flex items-center gap-3 text-[15px] font-medium text-ink-2"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-critical-bg text-critical-text">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M7 7l10 10" />
                      <path d="M17 7L7 17" />
                    </svg>
                  </span>
                  {pain}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col justify-center gap-1.5 rounded-2xl bg-pine p-6 text-cream">
            <span className="text-5xl leading-none font-extrabold tracking-[-0.03em] text-mustard tabular-nums">
              ~60
            </span>
            <span className="text-[13px] leading-snug text-sage">
              ngày công mỗi năm - mỗi quán tốn 1 ngày/tháng để tổng hợp sổ, chuỗi 5 chi nhánh mất
              60
            </span>
            <span className="text-[10px] text-sage/70">
              1 ngày/quán/tháng × 5 chi nhánh × 12 tháng
            </span>
          </div>
          {FAILURE_MODES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2 rounded-2xl bg-pine-2 p-6 text-cream"
            >
              <span className="flex items-center gap-2 text-[15px] font-bold text-mustard">
                <WarnIcon size={15} />
                {f.title}
              </span>
              <span className="text-[12px] leading-relaxed text-sage">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
