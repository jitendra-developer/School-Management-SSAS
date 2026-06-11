import type { IconType } from 'react-icons'
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineTrendingUp,
  HiOutlineClipboardCheck,
} from 'react-icons/hi'

export interface StatCardConfig {
  title: string
  value: string
  change: string
  changeType: 'up' | 'down' | 'neutral'
  icon: IconType
  iconBg: string
  iconColor: string
}

/** Placeholder dashboard metrics — replace with API data later */
export const DASHBOARD_STATS: StatCardConfig[] = [
  {
    title: 'Total Students',
    value: '1,245',
    change: '+12 this month',
    changeType: 'up',
    icon: HiOutlineUserGroup,
    iconBg: 'bg-blue-100',
    iconColor: 'text-primary-600',
  },
  {
    title: 'Total Teachers',
    value: '78',
    change: '+3 this month',
    changeType: 'up',
    icon: HiOutlineAcademicCap,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Pending Fees',
    value: '₹2,34,560',
    change: '-8% from last month',
    changeType: 'down',
    icon: HiOutlineCreditCard,
    iconBg: 'bg-orange-100',
    iconColor: 'text-accent-500',
  },
  {
    title: 'Monthly Collection',
    value: '₹4,78,900',
    change: '+15% this month',
    changeType: 'up',
    icon: HiOutlineTrendingUp,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    title: 'Today Attendance',
    value: '92%',
    change: '+2% from yesterday',
    changeType: 'up',
    icon: HiOutlineClipboardCheck,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
]
