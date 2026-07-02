import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap, HiOutlineCheck, HiOutlineX, HiOutlineSave, HiOutlineRefresh, HiOutlineCalendar } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import { attendanceService } from '@/services/attendanceService'
import { storage } from '@/utils/storage'
import api from '@/services/api'
import type { Student } from '@/types/student'

type PageState = 'login' | 'attendance'

export default function TeacherAttendance() {
  const [pageState, setPageState] = useState<PageState>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [teacher, setTeacher] = useState<Record<string, unknown> | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [date] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [hasSavedAttendance, setHasSavedAttendance] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (storage.getTeacherToken()) {
      fetchMyClass()
    } else {
      setCheckingAuth(false)
    }
  }, [])

  const fetchMyClass = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/teacher-app/my-class')
      if (data.data?.class) {
        setTeacher(data.data.teacher)
        setStudents(data.data.students)
        const loaded = data.data.attendance || {}
        setAttendance(loaded)
        const hasExisting = Object.keys(loaded).length > 0
        setHasSavedAttendance(hasExisting)
        initialLoadDone.current = true
        setPageState('attendance')
      } else {
        storage.clearTeacherAuth()
        toast.error(data.message || 'You are not assigned as a class teacher')
      }
    } catch {
      storage.clearTeacherAuth()
      toast.error('Session expired. Please login again.')
    } finally {
      setLoading(false)
      setCheckingAuth(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoginLoading(true)
    try {
      const res = await authService.teacherLogin({ email, password })
      const { token, teacher: t } = res.data.data!
      storage.setTeacherToken(token)
      storage.setTeacher(t)
      setTeacher(t)
      setEmail('')
      setPassword('')
      await fetchMyClass()
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    storage.clearTeacherAuth()
    setTeacher(null)
    setStudents([])
    setAttendance({})
    setPageState('login')
  }

  const toggleStatus = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId]
      if (current === 'present') return { ...prev, [studentId]: 'absent' }
      if (current === 'absent') return { ...prev, [studentId]: 'present' }
      return { ...prev, [studentId]: 'present' }
    })
  }

  const markAll = (status: string) => {
    const updated = { ...attendance }
    for (const s of students) {
      updated[s.id] = status
    }
    setAttendance(updated)
  }

  const handleSave = async () => {
    const records = students
      .filter((s) => attendance[s.id])
      .map((s) => ({ student_id: s.id, status: attendance[s.id] }))

    if (!records.length) {
      toast.error('No attendance to save')
      return
    }

    setSaving(true)
    try {
      await attendanceService.mark({ date, type: 'student', records })
      setHasSavedAttendance(true)
      toast.success('Attendance saved')
    } catch {
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (pageState === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 text-white shadow-lg">
              <HiOutlineAcademicCap className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Teacher Login</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to mark attendance</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="teacher@school.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  const cls = teacher?.class as { name?: string; section?: string } | undefined
  const t = teacher as { first_name?: string; last_name?: string } | undefined
  const total = students.length
  const marked = Object.keys(attendance).length
  const presents = Object.values(attendance).filter((v) => v === 'present').length
  const absents = Object.values(attendance).filter((v) => v === 'absent').length

  const isUpdate = hasSavedAttendance
  const SaveButton = ({ fullWidth }: { fullWidth?: boolean }) => (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60 ${fullWidth ? 'w-full' : ''}`}
    >
      {isUpdate ? <HiOutlineRefresh className="h-4 w-4" /> : <HiOutlineSave className="h-4 w-4" />}
      {saving ? 'Saving...' : isUpdate ? 'Update Attendance' : 'Save Attendance'}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {cls?.name}{cls?.section ? ` (${cls.section})` : ''}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              {t?.first_name} {t?.last_name}
              <span className="text-slate-300">|</span>
              <HiOutlineCalendar className="h-3.5 w-3.5 text-slate-400" />
              {date}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{marked}/{total} marked</span>
            <span className="text-xs text-emerald-600">{presents} present</span>
            <span className="text-xs text-red-600">{absents} absent</span>
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Top Save + Mark All */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SaveButton />
          <button onClick={() => markAll('present')} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
            <HiOutlineCheck className="h-3.5 w-3.5" /> All Present
          </button>
          <button onClick={() => markAll('absent')} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100">
            <HiOutlineX className="h-3.5 w-3.5" /> All Absent
          </button>
        </div>

        {/* Student List */}
        <div className="rounded-xl bg-white shadow-sm">
          {students.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">No students in this class</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((s, i) => {
                const status = attendance[s.id]
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center justify-between border-l-4 px-4 py-3 transition-all hover:bg-slate-50 ${
                      status === 'present' ? 'border-l-emerald-500 bg-emerald-50/30' : status === 'absent' ? 'border-l-red-500 bg-red-50/30' : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-xs font-bold text-white">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-slate-400">Roll: {s.roll_number || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                          status === 'present'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                          status === 'absent'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Save */}
        <div className="mt-4">
          <SaveButton fullWidth />
        </div>
      </div>
    </div>
  )
}
