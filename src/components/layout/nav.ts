export interface NavItem {
  to: string
  label: string
  badgeKey?: 'pendingLabels'
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/ton-kho', label: 'Tồn kho' },
  { to: '/giao-dich', label: 'Giao dịch' },
  { to: '/nhan-vien', label: 'Nhân viên & mã mời' },
  { to: '/nguyen-lieu', label: 'Nguyên liệu' },
  { to: '/duyet-nhan', label: 'Duyệt nhãn', badgeKey: 'pendingLabels' },
  { to: '/chat-thu', label: 'Chat thử' },
  { to: '/bao-cao', label: 'Báo cáo' },
]
