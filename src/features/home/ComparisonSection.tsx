import { CheckIcon } from './ZaloChat'
import { SectionHeading } from './SectionHeading'

type Cell = { text: string; state: 'bad' | 'mid' | 'good' }

const ROWS: { label: string; cells: [Cell, Cell, Cell] }[] = [
  {
    label: 'Nhân viên nhập bằng',
    cells: [
      { text: 'Tin nhắn Zalo', state: 'mid' },
      { text: 'App / web iPOS', state: 'mid' },
      { text: 'Tin nhắn Zalo', state: 'good' },
    ],
  },
  {
    label: 'Phải học thao tác mới',
    cells: [
      { text: 'Không', state: 'good' },
      { text: 'Có', state: 'bad' },
      { text: 'Không', state: 'good' },
    ],
  },
  {
    label: 'Hiểu tin gõ tự nhiên',
    cells: [
      { text: 'Không', state: 'bad' },
      { text: 'Không', state: 'bad' },
      { text: 'Có - hỏi lại khi chưa chắc', state: 'good' },
    ],
  },
  {
    label: 'Tồn kho tức thời',
    cells: [
      { text: 'Không', state: 'bad' },
      { text: 'Có', state: 'good' },
      { text: 'Có', state: 'good' },
    ],
  },
  {
    label: 'Phát hiện quên ghi',
    cells: [
      { text: 'Lục tay cuối tháng', state: 'bad' },
      { text: 'Tự trừ theo định lượng', state: 'mid' },
      { text: 'Đối soát iPOS mỗi tối', state: 'good' },
    ],
  },
]

function CellContent({ cell }: { cell: Cell }) {
  if (cell.state === 'good') {
    return (
      <span className="flex items-center gap-1.5 font-semibold text-pine">
        <CheckIcon size={13} />
        {cell.text}
      </span>
    )
  }
  if (cell.state === 'bad') {
    return (
      <span className="flex items-center gap-1.5 text-muted">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          aria-hidden="true"
          className="shrink-0 text-faint"
        >
          <path d="M7 7l10 10" />
          <path d="M17 7L7 17" />
        </svg>
        {cell.text}
      </span>
    )
  }
  return <span className="flex items-center gap-1.5 text-ink-2">{cell.text}</span>
}

export function ComparisonSection() {
  return (
    <section
      id="vi-sao"
      aria-labelledby="vi-sao-title"
      className="scroll-mt-28 border-t border-line bg-paper"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          headingId="vi-sao-title"
          align="center"
          eyebrow="Vì sao Storagemate"
          title="Vì sao chọn Storagemate"
          sub="Storagemate không thay iPOS - nó làm sạch phần dữ liệu kho mà iPOS chưa bao giờ thấy."
        />

        <div className="mt-12 overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <caption className="sr-only">
              So sánh Excel + nhóm Zalo, iPOS Inventory và Storagemate theo 5 tiêu chí
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-line px-5 py-4 text-left align-bottom text-[11px] font-medium text-muted"
                >
                  Tiêu chí
                </th>
                <th
                  scope="col"
                  className="border-b border-line px-5 py-4 text-left align-bottom text-[13px] font-bold text-ink-2"
                >
                  Excel + nhóm Zalo
                </th>
                <th
                  scope="col"
                  className="border-b border-line px-5 py-4 text-left align-bottom text-[13px] font-bold text-ink-2"
                >
                  iPOS Inventory
                </th>
                <th
                  scope="col"
                  className="border-b border-pine bg-pine px-5 py-4 text-left align-bottom text-[13px] font-extrabold text-cream"
                >
                  Storagemate
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="border-b border-line-soft px-5 py-4 text-left font-semibold text-ink"
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={
                        'border-b border-line-soft px-5 py-4 ' +
                        (i === 2 ? 'bg-mustard-soft' : '')
                      }
                    >
                      <CellContent cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="m-0 mt-4 flex items-center justify-center gap-2 text-center text-[12px] text-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            className="shrink-0 text-pine-3"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </svg>
          Đúng thứ quản lý cần: kho sạch mà không ai phải học app mới.
        </p>
      </div>
    </section>
  )
}
