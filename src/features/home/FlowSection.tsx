import { SectionHeading } from './SectionHeading'

const NODES = [
  {
    n: '01',
    title: 'Nhân viên',
    desc: 'Nhắn Zalo 1:1 kèm ảnh bằng chứng',
    theme: 'paper' as const,
  },
  {
    n: '02',
    title: 'Hiểu tin',
    desc: 'Regex → NER → LLM, hỏi lại OK/Sai khi chưa chắc',
    theme: 'pine' as const,
  },
  {
    n: '03',
    title: 'Sổ kho',
    desc: 'Chỉ thêm, không xóa. Tồn kho tức thời',
    theme: 'paper' as const,
  },
  {
    n: '04',
    title: 'Báo cáo',
    desc: 'Zalo lúc 21:30 + dashboard web',
    theme: 'mustard' as const,
  },
]

function NodeCard({ n, title, desc, theme }: (typeof NODES)[number]) {
  const isPine = theme === 'pine'
  const isMustard = theme === 'mustard'
  return (
    <div
      className={
        'flex h-full flex-col gap-3 rounded-2xl border p-5 ' +
        (isPine
          ? 'border-pine bg-pine text-cream'
          : isMustard
            ? 'border-mustard-deep bg-mustard text-pine'
            : 'border-line bg-paper text-ink')
      }
    >
      <div className="flex items-center justify-between">
        <span
          aria-hidden="true"
          className={
            'flex size-11 items-center justify-center rounded-full text-[13px] font-extrabold tabular-nums ' +
            (isPine
              ? 'bg-mustard text-pine'
              : isMustard
                ? 'bg-pine text-mustard'
                : 'bg-mustard text-pine')
          }
        >
          {n}
        </span>
        <span
          aria-hidden="true"
          className={
            'h-px w-10 ' + (isPine || isMustard ? (isPine ? 'bg-sage/40' : 'bg-pine/30') : 'bg-line')
          }
        />
      </div>
      <h3 className={'m-0 text-[19px] font-extrabold ' + (isPine ? 'text-cream' : 'text-pine')}>
        {title}
      </h3>
      <p
        className={
          'm-0 text-[13px] leading-relaxed ' +
          (isPine ? 'text-sage' : isMustard ? 'text-pine/90' : 'text-muted')
        }
      >
        {desc}
      </p>
    </div>
  )
}

function Arrow() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-pine-3)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="rotate-90 self-center lg:rotate-0"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function FlowSection() {
  return (
    <section
      id="cach-hoat-dong"
      aria-labelledby="flow-title"
      className="scroll-mt-28 bg-cream"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          headingId="flow-title"
          align="center"
          eyebrow="Cách hoạt động"
          title="Tin nhắn vào, sổ kho và báo cáo ra."
          sub="Bốn bước, mọi thứ xảy ra trong đúng cuộc trò chuyện Zalo mà nhân viên đang dùng."
        />

        <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
          {NODES.map((node, i) => (
            <div key={node.n} className="contents">
              <div className="flex-1">
                <NodeCard {...node} />
              </div>
              {i < NODES.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <span className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-pine-3 uppercase sm:w-40">
            Mỗi tối, tự động
          </span>
          <div className="flex flex-1 flex-col items-stretch gap-2 rounded-2xl border border-mustard-deep/40 bg-mustard-soft p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
            <div className="flex flex-1 flex-col gap-0.5 rounded-xl border border-line bg-paper px-4 py-3">
              <span className="text-[13px] font-bold text-pine">iPOS</span>
              <span className="text-[12px] text-muted">Báo cáo bán (Excel)</span>
            </div>
            <Arrow />
            <div className="flex flex-1 flex-col gap-0.5 rounded-xl border border-line bg-paper px-4 py-3">
              <span className="text-[13px] font-bold text-pine">Đối soát</span>
              <span className="text-[12px] text-muted">Bán vs. xuất → chênh lệch bằng đồng</span>
            </div>
          </div>
        </div>

        <p className="m-0 mt-4 text-center text-[12px] text-faint">
          Tin được nhân viên xác nhận OK được lưu làm dữ liệu huấn luyện; model NER học lại mỗi
          tuần.
        </p>
      </div>
    </section>
  )
}
