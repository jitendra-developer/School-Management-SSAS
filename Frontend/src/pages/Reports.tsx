import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { reportService } from '@/services/reportService'

export default function Reports() {
  const [data, setData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getDashboard(),
      reportService.getFees(),
      reportService.getAttendance(),
      reportService.getStudents(),
    ])
      .then(([d, f, a, s]) => {
        setData({
          dashboard: d.data?.data as unknown as Record<string, unknown>,
          fees: f.data?.data as unknown as Record<string, unknown>,
          attendance: a.data?.data as unknown as Record<string, unknown>,
          students: s.data?.data as unknown as Record<string, unknown>,
        })
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-400">Loading reports...</div>
  }

  const stats = (data.dashboard || {}) as Record<string, number>
  const feeSummary = ((data.fees || {}) as Record<string, unknown>).summary as Record<string, unknown> || {}
  const attSummary = ((data.attendance || {}) as Record<string, unknown>).summary as Record<string, unknown> || {}

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">School performance overview</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: String(stats.totalStudents || 0), color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Teachers', value: String(stats.totalTeachers || 0), color: 'from-emerald-500 to-teal-600' },
          { label: 'Collection Rate', value: `${stats.collectionRate || 0}%`, color: 'from-amber-500 to-orange-600' },
          { label: 'Attendance Rate', value: `${(attSummary.attendanceRate as number) || 0}%`, color: 'from-violet-500 to-purple-600' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
            <div className="p-5">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Fee Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Fee Amount</span><span className="font-medium text-slate-800">₹{Number(feeSummary.totalAmount || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Collected</span><span className="font-medium text-emerald-600">₹{Number(feeSummary.totalPaid || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Pending Amount</span><span className="font-medium text-red-600">₹{Number(feeSummary.pendingAmount || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Records</span><span className="font-medium text-slate-800">{String(feeSummary.totalFees || 0)}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Attendance Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Days</span><span className="font-medium text-slate-800">{String(attSummary.totalDays || 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Present</span><span className="font-medium text-emerald-600">{String(attSummary.totalPresent || 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Absent</span><span className="font-medium text-red-600">{String(attSummary.totalAbsent || 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Late</span><span className="font-medium text-amber-600">{String(attSummary.totalLate || 0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Attendance Rate</span><span className="font-semibold text-primary-600">{String((attSummary.attendanceRate as number) || 0)}%</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
