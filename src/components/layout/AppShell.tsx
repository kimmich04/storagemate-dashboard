import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-wrap items-stretch bg-ground text-sm text-ink tabular-nums">
      <Sidebar />
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-4 pt-7 pb-12 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
