import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: string
}

export function DashboardCard({ title, value, icon, color }: DashboardCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: color + '20', color }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
