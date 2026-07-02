import { NavLink } from 'react-router-dom'
import { HiOutlineBookOpen, HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from 'react-icons/hi'
import { NAV_GROUPS } from '@/constants/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  compact?: boolean
}

export function Sidebar({ isOpen, onClose, compact }: SidebarProps) {
  const { admin } = useAuth()
  const { updateSettings } = useTheme()

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-white/95 backdrop-blur-xl transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${compact ? 'w-16' : 'w-64'}`}
      >
        <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 shadow-lg shadow-primary-600/20">
            <HiOutlineBookOpen className="h-5 w-5 text-white" />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${compact ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <p className="text-sm font-bold leading-tight text-slate-800">Bright Future</p>
            <p className="text-[10px] text-slate-400">{admin?.school?.school_name || 'School Management'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.title || 'main'} className={compact ? 'mb-2' : 'mb-4'}>
              {group.title && (
                <p className={`mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 transition-all ${
                  compact ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
                }`}>
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          compact ? 'justify-center px-0' : ''
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-violet-50 text-primary-700 shadow-sm [&>svg]:text-primary-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`
                      }
                    >
                      <item.icon className={`shrink-0 ${compact ? 'h-6 w-6' : 'h-5 w-5'}`} />
                      <span className={`truncate transition-all duration-300 ${
                        compact ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'
                      }`}>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200/60 px-3 py-3">
          <button
            type="button"
            onClick={() => updateSettings({ sidebarCompact: !compact })}
            className={`flex w-full cursor-pointer items-center rounded-lg py-2.5 text-sm font-medium transition-all ${
              compact ? 'justify-center gap-0 text-slate-400 hover:text-slate-600' : 'gap-3 px-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title={compact ? 'Expand sidebar' : 'Compact sidebar'}
          >
            {compact ? <HiOutlineChevronDoubleRight className="h-5 w-5" /> : <HiOutlineChevronDoubleLeft className="h-5 w-5" />}
            <span className={`truncate transition-all duration-300 ${compact ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>Compact Sidebar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
