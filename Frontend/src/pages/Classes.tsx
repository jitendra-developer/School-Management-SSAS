import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineAcademicCap, HiOutlineChevronRight, HiOutlineUsers, HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineCurrencyRupee, HiOutlineBookOpen } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { classService } from '@/services/classService'
import { teacherService } from '@/services/teacherService'
import { subjectService } from '@/services/subjectService'
import type { Class } from '@/types/class'
import type { Teacher } from '@/types/teacher'

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [allSubjectNames, setAllSubjectNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', section: '', fee_amount: '', transport_fee: '', exam_fee: '', other_fee: '', teacher_id: '' })
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchClasses(); fetchTeachers(); fetchAllSubjects() }, [])

  const fetchClasses = async () => {
    try {
      const { data } = await classService.getAll()
      setClasses(data.data || [])
    } catch { toast.error('Failed to load classes') }
    finally { setLoading(false) }
  }

  const fetchTeachers = async () => {
    try {
      const { data } = await teacherService.getAll({ status: 'active', limit: '500' })
      setTeachers(data.data?.teachers || [])
    } catch { /* ignore */ }
  }

  const fetchAllSubjects = async () => {
    try {
      const { data } = await subjectService.getAll()
      setAllSubjectNames(data.data || [])
    } catch { /* ignore */ }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', section: '', fee_amount: '', transport_fee: '', exam_fee: '', other_fee: '', teacher_id: '' })
    setSubjects([])
    setSubjectInput('')
    setShowModal(true)
  }

  const openEdit = (cls: Class, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditing(cls)
    setForm({
      name: cls.name,
      section: cls.section || '',
      fee_amount: cls.fee_amount ? String(cls.fee_amount) : '',
      transport_fee: cls.transport_fee ? String(cls.transport_fee) : '',
      exam_fee: cls.exam_fee ? String(cls.exam_fee) : '',
      other_fee: cls.other_fee ? String(cls.other_fee) : '',
      teacher_id: cls.teachers?.[0]?.id || '',
    })
    setSubjects(cls.subjects?.map((s) => s.name) || [])
    setSubjectInput('')
    setShowModal(true)
  }

  const handleDelete = async (cls: Class, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete class "${cls.name}${cls.section ? ` (${cls.section})` : ''}"? This will also remove all associated students.`)) return
    try {
      await classService.delete(cls.id)
      toast.success('Class deleted')
      fetchClasses()
    } catch { toast.error('Failed to delete class') }
  }

  const addSubject = () => {
    const val = subjectInput.trim()
    if (val && !subjects.includes(val)) {
      setSubjects([...subjects, val])
    }
    setSubjectInput('')
  }

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx))
  }

  const handleSubjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSubject()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (!form.fee_amount) { toast.error('Fee Amount is required'); return }
    if (subjects.length === 0) { toast.error('At least one subject is required'); return }
    setSubmitting(true)
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      section: form.section.trim() || undefined,
      fee_amount: form.fee_amount ? parseFloat(form.fee_amount) : null,
      transport_fee: form.transport_fee ? parseFloat(form.transport_fee) : null,
      exam_fee: form.exam_fee ? parseFloat(form.exam_fee) : null,
      other_fee: form.other_fee ? parseFloat(form.other_fee) : null,
      teacher_id: form.teacher_id || null,
      subjects: subjects,
    }
    try {
      if (editing) {
        await classService.update(editing.id, payload)
        toast.success('Class updated')
      } else {
        await classService.create(payload)
        toast.success('Class created')
      }
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', section: '', fee_amount: '', transport_fee: '', exam_fee: '', other_fee: '', teacher_id: '' })
      setSubjects([])
      setSubjectInput('')
      fetchClasses()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${editing ? 'update' : 'create'} class`
      toast.error(msg)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="mt-1 text-sm text-slate-500">View all classes and their students</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02]"
        >
          <HiOutlinePlus className="h-4 w-4" /> Add Class
        </button>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="mt-2 h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-slate-400">No classes found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex"
            >
              <div className="glass-card group relative flex items-center gap-4 rounded-xl p-5 transition-all hover:shadow-lg w-full">
                <Link
                  to={`/classes/${cls.id}`}
                  className="absolute inset-0 rounded-xl"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 text-white shadow-lg pointer-events-none">
                  <HiOutlineAcademicCap className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 pointer-events-none">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {cls.name}{cls.section ? ` (${cls.section})` : ''}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineUsers className="h-4 w-4" />
                      {cls._count.students} student{cls._count.students !== 1 ? 's' : ''}
                    </span>
                    {cls.fee_amount != null && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <HiOutlineCurrencyRupee className="h-4 w-4" />
                        ₹{cls.fee_amount.toLocaleString()}
                      </span>
                    )}
                    {cls.teachers?.[0] && (
                      <span className="inline-flex items-center gap-1 text-blue-600">
                        <HiOutlineAcademicCap className="h-4 w-4" />
                        {cls.teachers[0].first_name} {cls.teachers[0].last_name}
                      </span>
                    )}
                    {cls.subjects && cls.subjects.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-violet-600">
                        <HiOutlineBookOpen className="h-4 w-4" />
                        {cls.subjects.length} subject{cls.subjects.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-1">
                  <button
                    onClick={(e) => openEdit(cls, e)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                    title="Edit class"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(cls, e)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete class"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                  <HiOutlineChevronRight className="h-5 w-5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditing(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Class' : 'Add Class'}</h2>
              <button onClick={() => { setShowModal(false); setEditing(null) }} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Class Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grade 10"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Section (optional)</label>
                <input
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. A"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fee Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      required
                      type="number"
                      value={form.fee_amount}
                      onChange={(e) => setForm({ ...form, fee_amount: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Transport Fee (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={form.transport_fee}
                      onChange={(e) => setForm({ ...form, transport_fee: e.target.value })}
                      placeholder="e.g. 1200"
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Exam Fee (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={form.exam_fee}
                      onChange={(e) => setForm({ ...form, exam_fee: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Other Fee (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={form.other_fee}
                      onChange={(e) => setForm({ ...form, other_fee: e.target.value })}
                      placeholder="e.g. 300"
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">Fee Amount will auto-fill when assigning fees to this class</p>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Class Teacher (optional)</label>
                <select
                  value={form.teacher_id}
                  onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">No class teacher</option>
                  {teachers
                    .filter((t) => !t.class_id || t.class_id === editing?.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name}{t.class ? ` (${t.class.name}${t.class.section ? ` ${t.class.section}` : ''})` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Subjects <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                  {subjects.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary-500 to-violet-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                      {s}
                      <button type="button" onClick={() => removeSubject(i)} className="cursor-pointer hover:text-red-200 transition-colors"><HiOutlineX className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        value={subjectInput}
                        onChange={(e) => { setSubjectInput(e.target.value); setShowSuggestions(true) }}
                        onKeyDown={handleSubjectKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Search or type new subject..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      {showSuggestions && subjectInput && allSubjectNames.filter((s) => !subjects.includes(s) && s.toLowerCase().includes(subjectInput.toLowerCase())).length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-10 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                          {allSubjectNames
                            .filter((s) => !subjects.includes(s) && s.toLowerCase().includes(subjectInput.toLowerCase()))
                            .slice(0, 8)
                            .map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); setSubjects([...subjects, s]); setSubjectInput('') }}
                                className="w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={addSubject} className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all">Add</button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">Type to search existing subjects or enter a new one. At least one subject is required.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null) }}
                  className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
