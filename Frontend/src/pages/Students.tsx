import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import type { Student } from '@/types/student'
import type { Class } from '@/types/class'

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [viewing, setViewing] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [feeStatus, setFeeStatus] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', class_id: '', email: '', phone: '',
    roll_number: '', gender: '', parent_name: '', parent_phone: '', address: '', dob: '',
    enrollment_date: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const clearError = (field: string) => {
    setFormErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const emptyForm = { first_name: '', last_name: '', class_id: '', email: '', phone: '', roll_number: '', gender: '', parent_name: '', parent_phone: '', address: '', dob: '', enrollment_date: '' }

  const closeForm = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setStep(1)
    setSubmitting(false)
  }

  const getErrors = () => {
    const errors: Record<string, string> = {}
    if (!form.first_name.trim()) errors.first_name = 'First name is required'
    if (!form.last_name.trim()) errors.last_name = 'Last name is required'
    if (!form.class_id) errors.class_id = 'Please select a class'
    if (!form.gender) errors.gender = 'Please select gender'
    if (!form.parent_name?.trim()) errors.parent_name = 'Parent name is required'
    if (!form.parent_phone?.trim()) errors.parent_phone = 'Parent phone is required'
    else if (!/^[\d\s\-+()]{7,20}$/.test(form.parent_phone)) errors.parent_phone = 'Invalid phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format'
    if (form.phone && !/^[\d\s\-+()]{7,20}$/.test(form.phone)) errors.phone = 'Invalid phone number'
    if (!form.roll_number?.trim()) errors.roll_number = 'Roll number is required'
    if (!form.dob) errors.dob = 'Date of birth is required'
    return errors
  }

  useEffect(() => { classService.getAll().then(({ data }) => setClasses(data.data || [])).catch(() => {}) }, [])

  useEffect(() => { fetchStudents() }, [selectedClass, feeStatus])

  const fetchStudents = async () => {
    try {
      const params: Record<string, string> = { limit: '50' }
      if (selectedClass) params.class_id = selectedClass
      if (feeStatus) params.fee_status = feeStatus
      const { data } = await studentService.getAll(params)
      setStudents(data.data?.students || [])
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    const errors = getErrors()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted errors')
      if (errors.class_id || errors.first_name || errors.last_name) setStep(1)
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        await studentService.update(editing.id, form)
        toast.success('Student updated')
      } else {
        await studentService.create(form)
        toast.success('Student created')
      }
      closeForm()
      fetchStudents()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Operation failed'
      toast.error(msg)
    }
    finally { setSubmitting(false) }
  }

  const handleEdit = (s: Student) => {
    setEditing(s)
    setForm({
      first_name: s.first_name, last_name: s.last_name, class_id: s.class_id,
      email: s.email || '', phone: s.phone || '',
      roll_number: s.roll_number || '', gender: s.gender || '',
      parent_name: s.parent_name || '',
      parent_phone: s.parent_phone || '', address: s.address || '', dob: s.dob || '',
      enrollment_date: s.enrollment_date?.split('T')[0] || '',
    })
    setFormErrors({})
    setStep(1)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return
    try {
      await studentService.delete(id)
      toast.success('Student deleted')
      fetchStudents()
    } catch { toast.error('Delete failed') }
  }

  const filtered = students.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all students under your school</p>
        </div>
        <button onClick={() => { setEditing(null); setFormErrors({}); setStep(1); setForm({ ...emptyForm, enrollment_date: new Date().toISOString().split('T')[0] }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Add Student
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>
            ))}
          </select>
          <select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
            <option value="">All Fees</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Gender</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Parent Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Parent Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Attendance</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Enrollment Date</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No students found</td></tr>
              ) : filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-xs font-bold text-white">{s.first_name[0]}{s.last_name[0]}</div>
                      <div><p className="font-medium text-slate-800">{s.first_name} {s.last_name}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.class?.name || '—'}{s.class?.section ? ` (${s.class.section})` : ''}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{s.gender || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.parent_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.parent_phone || '—'}</td>
                  <td className="px-4 py-3">
                    {s.attendance_percentage != null ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.attendance_percentage >= 75 ? 'bg-emerald-100 text-emerald-700' :
                        s.attendance_percentage >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          s.attendance_percentage >= 75 ? 'bg-emerald-500' :
                          s.attendance_percentage >= 50 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        {s.attendance_percentage}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(s)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><HiOutlineEye className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(s)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Student Details</h2>
              <button onClick={() => setViewing(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-lg font-bold text-white">
                  {viewing.first_name[0]}{viewing.last_name[0]}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{viewing.first_name} {viewing.last_name}</p>
                  <p className="text-sm text-slate-500">{viewing.class?.name ? `${viewing.class.name}${viewing.class.section ? ` (${viewing.class.section})` : ''}` : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Roll Number</p>
                  <p className="font-medium text-slate-700">{viewing.roll_number || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Gender</p>
                  <p className="font-medium text-slate-700 capitalize">{viewing.gender || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Phone</p>
                  <p className="font-medium text-slate-700">{viewing.phone || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Parent Name</p>
                  <p className="font-medium text-slate-700">{viewing.parent_name || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Parent Phone</p>
                  <p className="font-medium text-slate-700">{viewing.parent_phone || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Parent Email</p>
                  <p className="font-medium text-slate-700">{viewing.email || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="font-medium text-slate-700 capitalize">{viewing.status}</p>
                </div>
                <div>
                  <p className="text-slate-400">Attendance</p>
                  <p className="font-medium text-slate-700">{viewing.attendance_percentage != null ? `${viewing.attendance_percentage}%` : '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Enrollment Date</p>
                  <p className="font-medium text-slate-700">{viewing.enrollment_date ? new Date(viewing.enrollment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014'}</p>
                </div>
              </div>
              {viewing.address && (
                <div className="text-sm">
                  <p className="text-slate-400">Address</p>
                  <p className="font-medium text-slate-700">{viewing.address}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewing(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Student' : 'Add Student'}</h2>
              <button onClick={closeForm} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-primary-600' : 'bg-slate-300'}`} />
                <span className={`text-xs font-medium ${step === 1 ? 'text-primary-600' : 'text-slate-400'}`}>Basic Info</span>
                <div className="h-px flex-1 bg-slate-200" />
                <div className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-primary-600' : 'bg-slate-300'}`} />
                <span className={`text-xs font-medium ${step === 2 ? 'text-primary-600' : 'text-slate-400'}`}>Parent & Address</span>
              </div>

              {step === 1 && (
                <>
                  <div><label className="mb-1 block text-sm font-medium text-slate-700">Class</label><select value={form.class_id} onChange={(e) => { setForm({ ...form, class_id: e.target.value }); clearError('class_id') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.class_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`}>
                    <option value="">Select a class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>
                    ))}
                  </select>{formErrors.class_id && <p className="mt-1 text-xs text-red-500">{formErrors.class_id}</p>}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">First Name</label><input value={form.first_name} onChange={(e) => { setForm({ ...form, first_name: e.target.value }); clearError('first_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.first_name && <p className="mt-1 text-xs text-red-500">{formErrors.first_name}</p>}</div>
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label><input value={form.last_name} onChange={(e) => { setForm({ ...form, last_name: e.target.value }); clearError('last_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.last_name && <p className="mt-1 text-xs text-red-500">{formErrors.last_name}</p>}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Phone</label><input value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); clearError('phone') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}</div>
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Roll Number</label><input value={form.roll_number} onChange={(e) => { setForm({ ...form, roll_number: e.target.value }); clearError('roll_number') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.roll_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.roll_number && <p className="mt-1 text-xs text-red-500">{formErrors.roll_number}</p>}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Gender</label><select value={form.gender} onChange={(e) => { setForm({ ...form, gender: e.target.value }); clearError('gender') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`}>
                      <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>{formErrors.gender && <p className="mt-1 text-xs text-red-500">{formErrors.gender}</p>}</div>
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label><input type="date" value={form.dob} onChange={(e) => { setForm({ ...form, dob: e.target.value }); clearError('dob') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.dob ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.dob && <p className="mt-1 text-xs text-red-500">{formErrors.dob}</p>}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Enrollment Date</label><input type="date" value={form.enrollment_date} onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                    <div></div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Parent Name</label><input value={form.parent_name} onChange={(e) => { setForm({ ...form, parent_name: e.target.value }); clearError('parent_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.parent_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.parent_name && <p className="mt-1 text-xs text-red-500">{formErrors.parent_name}</p>}</div>
                    <div><label className="mb-1 block text-sm font-medium text-slate-700">Parent Email</label><input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); clearError('email') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}</div>
                  </div>
                  <div><label className="mb-1 block text-sm font-medium text-slate-700">Parent Phone</label><input value={form.parent_phone} onChange={(e) => { setForm({ ...form, parent_phone: e.target.value }); clearError('parent_phone') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.parent_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />{formErrors.parent_phone && <p className="mt-1 text-xs text-red-500">{formErrors.parent_phone}</p>}</div>
                  <div><label className="mb-1 block text-sm font-medium text-slate-700">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  {step > 1 && (
                    <button type="button" onClick={() => { setStep(step - 1); setFormErrors({}) }} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      <HiOutlineChevronLeft className="h-4 w-4" /> Previous
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeForm} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                  {step < 2 ? (
                    <button type="button" onClick={() => { const errs = getErrors(); const s1: Record<string, string> = {}; if (errs.class_id) s1.class_id = errs.class_id; if (errs.first_name) s1.first_name = errs.first_name; if (errs.last_name) s1.last_name = errs.last_name; if (errs.gender) s1.gender = errs.gender; if (errs.roll_number) s1.roll_number = errs.roll_number; if (errs.dob) s1.dob = errs.dob; if (errs.phone) s1.phone = errs.phone; setFormErrors(s1); if (Object.keys(s1).length === 0) setStep(step + 1) }} className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">
                      Next <HiOutlineChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" disabled={submitting} onClick={handleSubmit} className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

