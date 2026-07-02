import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { reportService } from '@/services/reportService'
import type { DashboardStats } from '@/types/report'

export default function Dashboard() {
  const { admin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    reportService.getDashboard()
      .then(({ data }) => setStats(data.data || null))
      .catch(() => toast.error('Failed to load dashboard'))
  }, [])

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents ?? '—', path: '/students', color: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? '—', path: '/teachers', color: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50' },
    { label: 'Pending Fees', value: stats ? `₹${(stats.pendingFeesAmount || 0).toLocaleString()}` : '—', path: '/fees', color: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50' },
    { label: 'Collection Rate', value: stats ? `${stats.collectionRate || 0}%` : '—', path: '/reports', color: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50' },
    { label: 'Teachers', value: stats?.activeTeachers ?? '—', path: '/teachers', color: 'from-rose-500 to-pink-600', lightBg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, <span className="gradient-text">{admin?.name?.split(' ')[0] ?? 'Admin'}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s your school overview today.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => (
          <motion.button
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => navigate(card.path)}
            className="glass-card group cursor-pointer rounded-xl p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <div className={`mb-3 inline-flex rounded-lg ${card.lightBg} p-2.5`}>
              <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${card.color}`} />
            </div>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-800">{card.value}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
              View details <HiOutlineArrowRight className="h-3 w-3" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', path: '/students', emoji: '🎓' },
              { label: 'Mark Attendance', path: '/attendance', emoji: '📋' },
              { label: 'Record Payment', path: '/fees', emoji: '💰' },
              { label: 'View Reports', path: '/reports', emoji: '📊' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="cursor-pointer rounded-xl border border-slate-200/60 bg-white/50 p-4 text-left transition-all hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm"
              >
                <span className="text-xl">{action.emoji}</span>
                <p className="mt-2 text-sm font-medium text-slate-700">{action.label}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
          <h2 className="mb-4 font-semibold text-slate-800">School Info</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500">School</span>
              <span className="font-medium text-slate-800">{admin?.school?.school_name || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{admin?.school?.email || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-sm">
              <span className="text-slate-500">Admin</span>
              <span className="font-medium text-slate-800">{admin?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Role</span>
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600 capitalize">{admin?.role || '—'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
