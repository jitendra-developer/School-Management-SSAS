import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineAcademicCap, HiOutlinePlus, HiOutlineUpload, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { classService } from '@/services/classService'
import { studentService } from '@/services/studentService'
import type { Class } from '@/types/class'
import type { Student } from '@/types/student'

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  roll_number: '', gender: '', parent_name: '', parent_phone: '', address: '', dob: '',
  enrollment_date: '',
}

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const [cls, setCls] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [viewing, setViewing] = useState<Student | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [classRes, studentsRes] = await Promise.all([
        classService.getById(id!),
        classService.getStudents(id!, { limit: '100' }),
      ])
      setCls(classRes.data.data || null)
      setStudents(studentsRes.data.data?.students || [])
    } catch { toast.error('Failed to load class data') }
    finally { setLoading(false) }
  }

  const clearError = (field: string) => {
    setFormErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const closeForm = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setStep(1)
    setSubmitting(false)
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    return `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, enrollment_date: new Date().toISOString().split('T')[0] })
    setFormErrors({})
    setStep(1)
    setShowModal(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({
      first_name: s.first_name, last_name: s.last_name,
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

  const getErrors = () => {
    const errors: Record<string, string> = {}
    if (!form.first_name.trim()) errors.first_name = 'First name is required'
    if (!form.last_name.trim()) errors.last_name = 'Last name is required'
    if (!form.gender) errors.gender = 'Please select gender'
    if (!form.roll_number?.trim()) errors.roll_number = 'Roll number is required'
    if (!form.dob) errors.dob = 'Date of birth is required'
    if (!form.parent_name?.trim()) errors.parent_name = 'Parent name is required'
    if (!form.parent_phone?.trim()) errors.parent_phone = 'Parent phone is required'
    else if (!/^[\d\s\-+()]{7,20}$/.test(form.parent_phone)) errors.parent_phone = 'Invalid phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format'
    if (form.phone && !/^[\d\s\-+()]{7,20}$/.test(form.phone)) errors.phone = 'Invalid phone number'
    return errors
  }

  const handleSubmit = async () => {
    const errors = getErrors()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted errors')
      if (errors.first_name || errors.last_name || errors.gender || errors.roll_number || errors.dob) setStep(1)
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        await studentService.update(editing.id, form)
        toast.success('Student updated')
      } else {
        await studentService.create({ ...form, class_id: id })
        toast.success('Student added')
      }
      closeForm()
      fetchData()
    } catch { toast.error('Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (s: Student) => {
    if (!confirm(`Remove ${s.first_name} ${s.last_name} from this class?`)) return
    try {
      await studentService.delete(s.id)
      toast.success('Student removed')
      fetchData()
    } catch { toast.error('Delete failed') }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="mt-1 h-4 w-24 rounded" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  {['Name', 'Roll No', 'DOB', 'Enrollment Date', 'Parent Name', 'Parent Phone', 'Parent Email', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Class not found</p>
        <Link to="/classes" className="mt-4 inline-flex items-center gap-1 text-primary-600 hover:underline">
          <HiOutlineArrowLeft className="h-4 w-4" /> Back to Classes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/classes" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
          <HiOutlineArrowLeft className="h-4 w-4" /> Back to Classes
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 text-white shadow-lg">
              <HiOutlineAcademicCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {cls.name}{cls.section ? ` (${cls.section})` : ''}
              </h1>
              <p className="text-sm text-slate-500">{cls._count.students} student{cls._count.students !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setBulkFile(null); setBulkResult(null); setShowBulkModal(true) }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition-all hover:bg-primary-50 hover:shadow-md"
            >
              <HiOutlineUpload className="h-4 w-4" /> Bulk Upload
            </button>
            <button
              onClick={openAdd}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02]"
            >
              <HiOutlinePlus className="h-4 w-4" /> Add Student
            </button>
          </div>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Roll No</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">DOB</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Enrollment Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Parent Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Parent Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Parent Email</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No students found</td></tr>
              ) : filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-xs font-bold text-white">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{s.first_name} {s.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.roll_number || '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.dob ? new Date(s.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.parent_name || '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.parent_phone || '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email || '\u2014'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(s)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                      <HiOutlineEye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(s)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600">
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Student Details</h2>
              <button onClick={() => setViewing(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-lg font-bold text-white">
                  {viewing.first_name[0]}{viewing.last_name[0]}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{viewing.first_name} {viewing.last_name}</p>
                  <p className="text-sm text-slate-500">{viewing.roll_number ? `Roll No: ${viewing.roll_number}` : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Gender</p>
                  <p className="font-medium text-slate-700 capitalize">{viewing.gender || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Phone</p>
                  <p className="font-medium text-slate-700">{viewing.phone || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">DOB</p>
                  <p className="font-medium text-slate-700">{viewing.dob ? new Date(viewing.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Enrollment Date</p>
                  <p className="font-medium text-slate-700">{viewing.enrollment_date ? new Date(viewing.enrollment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="font-medium text-slate-700 capitalize">{viewing.status}</p>
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

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Bulk Upload Students</h2>
              <button onClick={() => setShowBulkModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {bulkResult ? (
              <div className="space-y-4">
                <div className={`rounded-lg p-4 ${bulkResult.errors.length ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <p className="text-sm font-medium text-slate-700">
                    Successfully imported <span className="font-bold text-primary-600">{bulkResult.imported}</span> student(s)
                  </p>
                  {bulkResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-amber-700">{bulkResult.errors.length} row(s) skipped:</p>
                      <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
                        {bulkResult.errors.map((err, i) => (
                          <li key={i} className="text-xs text-amber-600">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => { setShowBulkModal(false); fetchData() }}
                    className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!bulkFile) return
                  setBulkUploading(true)
                  try {
                    const res = await classService.bulkUploadStudents(id!, bulkFile)
                    setBulkResult(res.data.data || null)
                  } catch {
                    toast.error('Upload failed')
                  } finally {
                    setBulkUploading(false)
                  }
                }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-500">
                  Upload a CSV or Excel file with the following columns:
                </p>
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-medium text-slate-700 mb-1">Required columns:</p>
                  <code className="block">student_name (or first_name + last_name), roll_no, parent_name, parent_number, gender, dob, enrollment_date</code>
                  <p className="font-medium text-slate-700 mt-2 mb-1">Optional columns:</p>
                  <code className="block">email, phone, address</code>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); setBulkFile(e.dataTransfer.files?.[0] || null) }}
                  className={`flex items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300'}`}
                >
                  <label className="flex cursor-pointer flex-col items-center gap-2">
                    <HiOutlineUpload className={`h-8 w-8 ${dragOver ? 'text-primary-500' : 'text-slate-400'}`} />
                    <span className={`text-sm ${dragOver ? 'text-primary-600' : 'text-slate-500'}`}>
                      {bulkFile ? bulkFile.name : 'Drop file here or click to select'}
                    </span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!bulkFile || bulkUploading}
                    className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
                  >
                    {bulkUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Student' : 'Add Student'}</h2>
              <button onClick={closeForm} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                      <input value={form.first_name} onChange={(e) => { setForm({ ...form, first_name: e.target.value }); clearError('first_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.first_name && <p className="mt-1 text-xs text-red-500">{formErrors.first_name}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                      <input value={form.last_name} onChange={(e) => { setForm({ ...form, last_name: e.target.value }); clearError('last_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.last_name && <p className="mt-1 text-xs text-red-500">{formErrors.last_name}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                      <input value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); clearError('phone') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Roll Number</label>
                      <input value={form.roll_number} onChange={(e) => { setForm({ ...form, roll_number: e.target.value }); clearError('roll_number') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.roll_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.roll_number && <p className="mt-1 text-xs text-red-500">{formErrors.roll_number}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                      <select value={form.gender} onChange={(e) => { setForm({ ...form, gender: e.target.value }); clearError('gender') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.gender && <p className="mt-1 text-xs text-red-500">{formErrors.gender}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
                      <input type="date" value={form.dob} onChange={(e) => { setForm({ ...form, dob: e.target.value }); clearError('dob') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.dob ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.dob && <p className="mt-1 text-xs text-red-500">{formErrors.dob}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Enrollment Date</label>
                      <input type="date" value={form.enrollment_date} onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                    </div>
                    <div></div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Parent Name</label>
                      <input value={form.parent_name} onChange={(e) => { setForm({ ...form, parent_name: e.target.value }); clearError('parent_name') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.parent_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.parent_name && <p className="mt-1 text-xs text-red-500">{formErrors.parent_name}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Parent Email</label>
                      <input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); clearError('email') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                      {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Parent Phone</label>
                    <input value={form.parent_phone} onChange={(e) => { setForm({ ...form, parent_phone: e.target.value }); clearError('parent_phone') }} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.parent_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'}`} />
                    {formErrors.parent_phone && <p className="mt-1 text-xs text-red-500">{formErrors.parent_phone}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                  </div>
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
                      <button type="button" onClick={() => { const errs = getErrors(); const s1: Record<string, string> = {}; if (errs.first_name) s1.first_name = errs.first_name; if (errs.last_name) s1.last_name = errs.last_name; if (errs.gender) s1.gender = errs.gender; if (errs.roll_number) s1.roll_number = errs.roll_number; if (errs.dob) s1.dob = errs.dob; if (errs.phone) s1.phone = errs.phone; setFormErrors(s1); if (Object.keys(s1).length === 0) setStep(step + 1) }} className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">
                      Next <HiOutlineChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" disabled={submitting} onClick={handleSubmit} className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60">
                      {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                    </button>
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



