import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineClipboardCheck, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineAcademicCap } from 'react-icons/hi'
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

  const items = tab === 'student' ? students : teachers

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
            const name = 'first_name' in item
              ? `${(item as Student).first_name} ${(item as Student).last_name}`
              : `${(item as Teacher).first_name} ${(item as Teacher).last_name}`
            const subtitle = 'class' in item
              ? ((item as Student).class?.name || '')
              : ((item as Teacher).subject || '')
            return (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${status === 'present' ? 'bg-emerald-100 text-emerald-600' : status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{name}</p>
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
    </div>
  )
}
