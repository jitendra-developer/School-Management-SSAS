import type { IconType } from 'react-icons'
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineClipboardCheck,
  HiOutlineViewList,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlineBookOpen,
  HiOutlineOfficeBuilding,
  HiOutlineSpeakerphone,
  HiOutlineChat,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineCog,
  HiOutlineUser,
} from 'react-icons/hi'

export interface NavItem {
  label: string
  path: string
  icon: IconType
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/** Sidebar navigation — paths are placeholders for future modules */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: HiOutlineHome }],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Classes', path: '/classes', icon: HiOutlineViewList },
      { label: 'Students', path: '/students', icon: HiOutlineUserGroup },
      { label: 'Teachers', path: '/teachers', icon: HiOutlineAcademicCap },
      { label: 'Attendance', path: '/attendance', icon: HiOutlineClipboardCheck },
      { label: 'Fees Management', path: '/fees', icon: HiOutlineCreditCard },
      { label: 'Examinations', path: '/examinations', icon: HiOutlineDocumentText },
      { label: 'Timetable', path: '/timetable', icon: HiOutlineCalendar },
      { label: 'Transport', path: '/transport', icon: HiOutlineTruck },
      { label: 'Library', path: '/library', icon: HiOutlineBookOpen },
      { label: 'Hostel', path: '/hostel', icon: HiOutlineOfficeBuilding },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { label: 'Notice Board', path: '/notices', icon: HiOutlineSpeakerphone },
      { label: 'Messages', path: '/messages', icon: HiOutlineChat },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { label: 'Reports', path: '/reports', icon: HiOutlineChartBar },
      { label: 'Analytics', path: '/analytics', icon: HiOutlineTrendingUp },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Settings', path: '/settings', icon: HiOutlineCog },
      { label: 'Profile', path: '/profile', icon: HiOutlineUser },
    ],
  },
]
