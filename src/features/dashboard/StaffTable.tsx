import type { StaffStat } from '../../api/types'
import { Card } from '../../components/ui/Card'

const th = 'border-b border-line py-2 px-2 font-medium'
const td = 'border-b border-line-soft py-2.5 px-2'

export function StaffTable({ staff, className }: { staff: StaffStat[]; className?: string }) {
  return (
    <Card title="Nhân viên" action={<a href="/nhan-vien" className="text-[13px]">Thêm nhân viên</a>} gapClass="gap-3" className={className}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className={`${th} pl-0`}>Tên</th>
              <th scope="col" className={th}>Vai trò</th>
              <th scope="col" className={`${th} text-right`}>Tin kho</th>
              <th scope="col" className={th}>Đúng cú pháp</th>
              <th scope="col" className={`${th} pr-0 text-right`}>Lần Hủy</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((p) => (
              <tr key={p.id}>
                <td className={`${td} pl-0 font-semibold`}>{p.name}</td>
                <td className={`${td} text-muted`}>{p.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</td>
                <td className={`${td} text-right`}>{p.messages}</td>
                <td className={td}>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-[1_1_60px] overflow-hidden rounded-full bg-grid">
                      <span className="block h-full rounded-full bg-series-in" style={{ width: `${p.syntaxOkPct}%` }} />
                    </span>
                    <span className="w-[34px] text-right">{p.syntaxOkPct}%</span>
                  </span>
                </td>
                <td className={`${td} pr-0 text-right`}>{p.undoCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
