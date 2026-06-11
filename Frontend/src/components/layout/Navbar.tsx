import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineCalendar,
  HiOutlineCog,
  HiOutlineUser,
} from 'react-icons/hi'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/60 px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <HiOutlineMenu className="h-6 w-6" />
      </button>

      <div className="hidden flex-1 sm:block sm:max-w-md">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search anything..."
            className="w-full rounded-xl border-0 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 text-[10px] font-bold text-white shadow-sm">
            5
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-600 text-sm font-bold text-white shadow-sm">
              {admin?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-700">{admin?.name ?? 'Admin'}</p>
              <p className="text-xs text-slate-400 capitalize">{admin?.role ?? 'Super Admin'}</p>
            </div>
            <HiOutlineChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200/60">
                <button onClick={() => { setProfileOpen(false); navigate('/profile') }} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <HiOutlineUser className="h-4 w-4" /> Profile
                </button>
                <button onClick={() => { setProfileOpen(false); navigate('/settings') }} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <HiOutlineCog className="h-4 w-4" /> Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button onClick={() => { setProfileOpen(false); logout(); navigate('/login') }} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <HiOutlineLogout className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function DatePickerButton() {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-white hover:shadow-md transition-all"
    >
      <HiOutlineCalendar className="h-4 w-4 text-primary-500" />
      {today}
    </button>
  )
}
