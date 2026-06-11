import { motion } from 'framer-motion'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import type { StatCardConfig } from '@/constants/dashboard'

interface StatCardProps extends StatCardConfig {
  index?: number
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
  iconColor,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {changeType === 'up' && <HiArrowUp className="text-emerald-500" />}
            {changeType === 'down' && <HiArrowDown className="text-red-500" />}
            <span
              className={
                changeType === 'up'
                  ? 'text-emerald-600'
                  : changeType === 'down'
                    ? 'text-red-600'
                    : 'text-slate-500'
              }
            >
              {change}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
