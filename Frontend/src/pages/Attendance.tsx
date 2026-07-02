import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineClipboardCheck, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { attendanceService } from '@/services/attendanceService'
import { studentService } from '@/services/studentService'
import { teacherService } from '@/services/teacherService'
import type { Student } from '@/types/student'
import type { Teacher } from '@/types/teacher'

type TabType = 'student' | 'teacher'

export default function Attendance() {
  const [tab, setTab] = useState<TabType>('student')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [showHistory, setShowHistory] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [historyMonth, setHistoryMonth] = useState(String(new Date().getMonth() + 1))
  const [historyYear, setHistoryYear] = useState(String(new Date().getFullYear()))
  const [historyRecords, setHistoryRecords] = useState<Array<{ date: string; status: string }>>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (tab === 'student') fetchStudents()
    else fetchTeachers()
  }, [tab])

  useEffect(() => {
    fetchAttendance()
  }, [date, tab])

  const fetchStudents = async () => {
    try {
      const { data } = await studentService.getAll({ limit: '100', status: 'active' })
      setStudents(data.data?.students || [])
    } catch { toast.error('Failed to load students') }
    finally { setFetching(false) }
  }

  const fetchTeachers = async () => {
    try {
      const { data } = await teacherService.getAll({ limit: '50', status: 'active' })
      setTeachers(data.data?.teachers || [])
    } catch { toast.error('Failed to load teachers') }
    finally { setFetching(false) }
  }

  const fetchAttendance = async () => {
    try {
      const { data } = await attendanceService.getByDate(date, { type: tab })
      const records = (data.data as Record<string, unknown>)?.student_attendance || (data.data as Record<string, unknown>)?.teacher_attendance || []
      const map: Record<string, string> = {}
      for (const r of records as Array<{ student_id?: string; teacher_id?: string; status: string }>) {
        map[r.student_id || r.teacher_id || ''] = r.status
      }
      setAttendance(map)
    } catch { setAttendance({}) }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const records = Object.entries(attendance).map(([key, status]) => ({
      ...(tab === 'student' ? { student_id: key } : { teacher_id: key }),
      status,
    }))
    try {
      await attendanceService.mark({ date, type: tab, records })
      toast.success('Attendance saved')
    } catch { toast.error('Failed to save attendance') }
    finally { setLoading(false) }
  }

  const markAll = (status: string) => {
    const items = tab === 'student' ? students : teachers
    const map: Record<string, string> = {}
    for (const item of items) map[item.id] = status
    setAttendance((prev) => ({ ...prev, ...map }))
  }

  const fetchHistory = async () => {
    if (!selectedPersonId) { toast.error('Select a person first'); return }
    setHistoryLoading(true)
    try {
      const fn = tab === 'student' ? attendanceService.getStudentRecords : attendanceService.getTeacherRecords
      const { data } = await fn(selectedPersonId, { month: historyMonth, year: historyYear, limit: '31' })
      const raw = ((data.data || data) as unknown) as Array<Record<string, unknown>>
      const mapped = raw.map((r) => {
        const att = r.attendance as Record<string, string>
        return { date: att?.date?.split('T')[0] || '', status: r.status as string }
      }).sort((a, b) => a.date.localeCompare(b.date))
      setHistoryRecords(mapped)
    } catch { toast.error('Failed to load history') }
    finally { setHistoryLoading(false) }
  }

  useEffect(() => {
    if (showHistory && selectedPersonId) fetchHistory()
  }, [showHistory, selectedPersonId, historyMonth, historyYear])

  const items = tab === 'student' ? students : teachers

  const getName = (item: Student | Teacher) =>
    'first_name' in item
      ? `${(item as Student).first_name} ${(item as Student).last_name}`
      : `${(item as Teacher).first_name} ${(item as Teacher).last_name}`

  const statusIcon = (s: string) => {
    if (s === 'present') return <HiOutlineCheckCircle className="h-4 w-4 text-emerald-500" />
    if (s === 'absent') return <HiOutlineXCircle className="h-4 w-4 text-red-500" />
    return <HiOutlineClock className="h-4 w-4 text-amber-500" />
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">Mark daily attendance</p>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab('student')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'student' ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineUserGroup className="mr-1.5 inline-block h-4 w-4" /> Students
            </button>
            <button onClick={() => setTab('teacher')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'teacher' ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineAcademicCap className="mr-1.5 inline-block h-4 w-4" /> Teachers
            </button>
          </div>
          <div className="flex items-center gap-3">
            <HiOutlineCalendar className="h-5 w-5 text-slate-400" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
      </div>

      {!fetching && (
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="cursor-pointer rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors">All Present</button>
          <button onClick={() => markAll('absent')} className="cursor-pointer rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors">All Absent</button>
          <button onClick={() => markAll('late')} className="cursor-pointer rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors">All Late</button>
          <button onClick={() => setAttendance({})} className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors ml-auto">Clear</button>
          <button onClick={() => setShowHistory(!showHistory)} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${showHistory ? 'bg-primary-100 text-primary-700' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <HiOutlineClock className="mr-1 inline h-4 w-4" /> History
          </button>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {fetching ? (
            <div className="px-4 py-12 text-center text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400">No {tab === 'student' ? 'students' : 'teachers'} found</div>
          ) : items.map((item) => {
            const status = attendance[item.id] || 'present'
            const statusStyles: Record<string, string> = {
              present: 'ring-2 ring-emerald-400 bg-emerald-50 text-emerald-700',
              absent: 'ring-2 ring-red-400 bg-red-50 text-red-700',
              late: 'ring-2 ring-amber-400 bg-amber-50 text-amber-700',
            }
            const subtitle = 'class' in item
              ? ((item as Student).class?.name || '')
              : ((item as Teacher).subject || '')
            return (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${status === 'present' ? 'bg-emerald-100 text-emerald-600' : status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {getName(item)[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{getName(item)}</p>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {['present', 'absent', 'late'].map((s) => (
                    <button key={s} onClick={() => setAttendance((prev) => ({ ...prev, [item.id]: s }))} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${status === s ? statusStyles[s] : 'text-slate-400 hover:bg-slate-100'}`}>
                      {s === 'present' ? 'P' : s === 'absent' ? 'A' : 'L'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {items.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-60">
            <HiOutlineClipboardCheck className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}

      {showHistory && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Monthly Attendance History</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3 mb-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Select {tab === 'student' ? 'Student' : 'Teacher'}</label>
              <select value={selectedPersonId} onChange={(e) => setSelectedPersonId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                <option value="">Choose...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{getName(item)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Month</label>
              <select value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Year</label>
              <select value={historyYear} onChange={(e) => setHistoryYear(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading history...</div>
          ) : historyRecords.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No attendance records found for this period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 bg-slate-50/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Day</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((r) => {
                    const d = new Date(r.date + 'T00:00:00')
                    return (
                      <tr key={r.date} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 text-slate-800">{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-2.5 text-slate-500">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700' : r.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {statusIcon(r.status)} {r.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
