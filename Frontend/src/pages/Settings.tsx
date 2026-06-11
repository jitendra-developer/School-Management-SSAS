import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineBell,
  HiOutlineBellAlert,
  HiOutlineBellSlash,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlinePaintBrush,
  HiOutlineCheckCircle,
  HiOutlineDeviceTablet,
} from 'react-icons/hi2'
import { useAuth } from '@/context/AuthContext'

type Tab = 'school' | 'notifications' | 'appearance'

export default function Settings() {
  const { admin } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('school')

  const [schoolForm, setSchoolForm] = useState({
    school_name: admin?.school?.school_name || '',
    email: admin?.school?.email || '',
    phone: admin?.school?.phone || '',
    address: admin?.school?.address || '',
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    feeReminders: true,
    attendanceAlerts: true,
    marketingEmails: false,
  })

  const [appearance, setAppearance] = useState({
    theme: 'light',
    sidebarCompact: false,
  })

  const [saving, setSaving] = useState(false)

  const handleSaveSchool = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      toast.success('School settings updated')
    } catch {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof HiOutlineBuildingOffice2 }[] = [
    { key: 'school', label: 'School', icon: HiOutlineBuildingOffice2 },
    { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { key: 'appearance', label: 'Appearance', icon: HiOutlinePaintBrush },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your school and preferences</p>
      </motion.div>

      <div className="flex gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/60">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'school' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="mb-5 font-semibold text-slate-800">School Information</h3>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiOutlineBuildingOffice2 className="h-4 w-4 text-slate-400" />
                School Name
              </label>
              <input
                type="text"
                value={schoolForm.school_name}
                onChange={(e) => setSchoolForm((p) => ({ ...p, school_name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <HiOutlineEnvelope className="h-4 w-4 text-slate-400" />
                  School Email
                </label>
                <input
                  type="email"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <HiOutlinePhone className="h-4 w-4 text-slate-400" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={schoolForm.phone}
                  onChange={(e) => setSchoolForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiOutlineMapPin className="h-4 w-4 text-slate-400" />
                Address
              </label>
              <textarea
                value={schoolForm.address}
                onChange={(e) => setSchoolForm((p) => ({ ...p, address: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <HiOutlineGlobeAlt className="h-4 w-4" />
                Changes are saved to your school profile
              </div>
              <button
                type="button"
                onClick={handleSaveSchool}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all hover:shadow-primary-600/30 disabled:opacity-50"
              >
                <HiOutlineCheckCircle className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="mb-5 font-semibold text-slate-800">Notification Preferences</h3>

          <div className="space-y-1">
            {[
              { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email alerts for important updates', icon: HiOutlineBell },
              { key: 'feeReminders' as const, label: 'Fee Reminders', desc: 'Get notified about pending fee payments', icon: HiOutlineBellAlert },
              { key: 'attendanceAlerts' as const, label: 'Attendance Alerts', desc: 'Daily attendance summary reports', icon: HiOutlineDeviceTablet },
              { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Product updates and feature announcements', icon: HiOutlineBellSlash },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => {
                      setNotifications((p) => ({ ...p, [item.key]: !p[item.key] }))
                      toast.success(`${item.label} ${notifications[item.key] ? 'disabled' : 'enabled'}`)
                    }}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="mb-5 font-semibold text-slate-800">Appearance</h3>

          <div className="space-y-6">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiOutlineSun className="h-4 w-4 text-slate-400" />
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: HiOutlineSun, desc: 'Clean and bright' },
                  { value: 'dark', label: 'Dark', icon: HiOutlineMoon, desc: 'Easy on the eyes' },
                  { value: 'system', label: 'System', icon: HiOutlineDeviceTablet, desc: 'Follow device' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAppearance((p) => ({ ...p, theme: option.value }))}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      appearance.theme === option.value
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-slate-200/60 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      appearance.theme === option.value ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <label className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <HiOutlineDeviceTablet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Compact Sidebar</p>
                    <p className="text-xs text-slate-400">Reduce sidebar width for more space</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={appearance.sidebarCompact}
                    onChange={() => setAppearance((p) => ({ ...p, sidebarCompact: !p.sidebarCompact }))}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full" />
                </label>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
