import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: ReactNode
  /** Bên phải: bộ lọc kỳ, nút "Xuất báo cáo"... Bỏ trống thì chỉ có tên trang. */
  children?: ReactNode
}

/**
 * Khu đầu trang dùng chung: tên trang + dòng phụ + (tùy trang) bộ lọc kỳ / nút.
 * Từ 780px (cùng ngưỡng với Sidebar) khu này cố định ở đầu khung nội dung khi trang cuộn; nền trùng nền trang
 * và lấn ra hết lề của <main> (-mx / -mt) để nội dung cuộn qua không lộ ra hai bên hay phía trên.
 * Dưới 780px không cố định vì bộ lọc xuống dòng sẽ chiếm quá nhiều chiều cao màn hình nhỏ.
 */
export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <header className="-mx-4 -mt-7 flex flex-wrap items-end justify-between gap-4 bg-ground px-4 pt-7 pb-3 sm:-mx-8 sm:px-8 min-[780px]:sticky min-[780px]:top-0 min-[780px]:z-20">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{title}</h1>
        <span className="text-muted">{subtitle}</span>
      </div>
      {children}
    </header>
  )
}
