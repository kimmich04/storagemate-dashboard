import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { NAV_PAGES } from './components/layout/nav'
import DashboardPage from './pages/DashboardPage'
import InboundPage from './pages/InboundPage'
import ItemsPage from './pages/ItemsPage'
import OutboundPage from './pages/OutboundPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import StockPage from './pages/StockPage'

/** Đường dẫn đã có trang thật; các mục menu còn lại hiện trang giữ chỗ. */
const BUILT = new Set(['/', '/ton-kho', '/giao-dich/nhap-kho', '/giao-dich/xuat-kho', '/danh-muc'])

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/ton-kho" element={<StockPage />} />
        <Route path="/giao-dich" element={<Navigate to="/giao-dich/nhap-kho" replace />} />
        <Route path="/giao-dich/nhap-kho" element={<InboundPage />} />
        <Route path="/giao-dich/xuat-kho" element={<OutboundPage />} />
        <Route path="/danh-muc" element={<ItemsPage />} />
        {NAV_PAGES.filter((n) => !BUILT.has(n.to)).map((n) => (
          <Route key={n.to} path={n.to} element={<PlaceholderPage title={n.label} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
