export interface NavItem {
  to: string
  label: string
  badgeKey?: 'pendingLabels'
  /** Có `children` → mục này chỉ là nhóm (không phải trang), các trang con hiện thụt vào bên dưới. */
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/ton-kho', label: 'Tồn kho' },
  {
    to: '/giao-dich',
    label: 'Giao dịch',
    children: [
      { to: '/giao-dich/nhap-kho', label: 'Nhập Kho' },
      { to: '/giao-dich/xuat-kho', label: 'Xuất Kho' },
    ],
  },
  { to: '/nhan-vien', label: 'Nhân viên & mã mời' },
  { to: '/danh-muc', label: 'Danh mục hàng hóa' },
  { to: '/duyet-nhan', label: 'Duyệt nhãn', badgeKey: 'pendingLabels' },
  { to: '/chat-thu', label: 'Chat thử' },
  { to: '/bao-cao', label: 'Báo cáo' },
]

/** Các mục là trang thật (bỏ mục nhóm, mở phẳng các mục con). */
export const NAV_PAGES: NavItem[] = NAV_ITEMS.flatMap((n) => n.children ?? [n])
