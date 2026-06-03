import type { ReservationStatus } from '../types'
import { STATUS_CONFIG } from '../types'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as ReservationStatus] ?? { label: status, color: 'bg-gray-100 text-gray-800', dot: '' }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.dot && <span aria-hidden="true">{config.dot}</span>}
      {config.label}
    </span>
  )
}
