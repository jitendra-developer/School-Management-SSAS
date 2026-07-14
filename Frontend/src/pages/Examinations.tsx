import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { examService } from '@/services/examService'
import type { Exam, ExamResult } from '@/types/exam'

const typeColors: Record<string, string> = {
  midterm: 'bg-blue-100 text-blue-700',
  final: 'bg-purple-100 text-purple-700',
  quiz: 'bg-amber-100 text-amber-700',
}

export default function Examinations() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultSubmitting, setResultSubmitting] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ExamResult[]>>({})
  const [showResultModal, setShowResultModal] = useState<string | null>(null)
  const [resultForm, setResultForm] = useState({ student_id: '', marks_obtained: '', grade: '' })
  const [form, setForm] = useState({ title: '', subject: '', class_id: '', type: 'midterm', date: '', max_marks: '' })

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    try {
      const { data } = await examService.getAll({ limit: '50' })
      setExams(data.data?.exams || [])
    } catch { toast.error('Failed to load exams') }
    finally { setLoading(false) }
  }

  const toggleExpand = async (examId: string) => {
    if (expandedId === examId) { setExpandedId(null); return }
    setExpandedId(examId)
    if (!results[examId]) {
      try {
        const { data } = await examService.getResults(examId)
        setResults((prev) => ({ ...prev, [examId]: data.data || [] }))
      } catch { setResults((prev) => ({ ...prev, [examId]: [] })) }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form, max_marks: parseFloat(form.max_marks) }
      if (editing) { await examService.update(editing.id, payload); toast.success('Exam updated') }
      else { await examService.create(payload); toast.success('Exam created') }
      setShowModal(false); setEditing(null)
      setForm({ title: '', subject: '', class_id: '', type: 'midterm', date: '', max_marks: '' })
      fetchExams()
    } catch { toast.error('Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleEdit = (e: Exam) => {
    setEditing(e)
    setForm({ title: e.title, subject: e.subject, class_id: e.class_id, type: e.type, date: e.date?.split('T')[0] || '', max_marks: String(e.max_marks) })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return
    try { await examService.delete(id); toast.success('Exam deleted'); fetchExams() }
    catch { toast.error('Delete failed') }
  }

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showResultModal) return
    setResultSubmitting(true)
    try {
      await examService.recordResult(showResultModal, { ...resultForm, marks_obtained: parseFloat(resultForm.marks_obtained) })
      toast.success('Result recorded')
      setShowResultModal(null)
      setResultForm({ student_id: '', marks_obtained: '', grade: '' })
      if (expandedId === showResultModal) {
        const { data } = await examService.getResults(showResultModal)
        setResults((prev) => ({ ...prev, [showResultModal]: data.data || [] }))
      }
    } catch { toast.error('Failed to record result') }
    finally { setResultSubmitting(false) }
  }

  const filtered = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Examinations</h1>
          <p className="mt-1 text-sm text-slate-500">Manage exams and results</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ title: '', subject: '', class_id: '', type: 'midterm', date: '', max_marks: '' }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Add Exam
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Max Marks</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No exams found</td></tr>
              ) : filtered.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleExpand(e.id)} className="flex items-center gap-2 font-medium text-slate-800 hover:text-primary-600 cursor-pointer">
                      {expandedId === e.id ? <HiOutlineChevronDown className="h-3.5 w-3.5" /> : <HiOutlineChevronRight className="h-3.5 w-3.5" />}
                      {e.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.subject}</td>
                  <td className="px-4 py-3 text-slate-600">{e.class?.name || '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[e.type] || 'bg-slate-100 text-slate-600'}`}>{e.type}</span></td>
                  <td className="px-4 py-3 text-slate-600">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{e.max_marks}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setShowResultModal(e.id); setResultForm({ student_id: '', marks_obtained: '', grade: '' }) }} className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors mr-1">Results</button>
                    <button onClick={() => handleEdit(e)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(e.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                  </td>
                </motion.tr>
              ))}
              {filtered.map((e) => expandedId === e.id && (
                <motion.tr key={`${e.id}-results`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td colSpan={7} className="px-4 py-3 bg-slate-50/50">
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Student</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Marks</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-600">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(results[e.id] || []).length === 0 ? (
                            <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">No results recorded</td></tr>
                          ) : results[e.id]?.map((r) => (
                            <tr key={r.id} className="border-b border-slate-50 last:border-0">
                              <td className="px-3 py-2 text-slate-700">{r.student?.first_name} {r.student?.last_name}</td>
                              <td className="px-3 py-2 text-slate-700">{r.marks_obtained}/{e.max_marks}</td>
                              <td className="px-3 py-2"><span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">{r.grade || '—'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Exam' : 'Add Exam'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Class ID</label><input required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} placeholder="Enter class ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Type</label><select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="midterm">Midterm</option><option value="final">Final</option><option value="quiz">Quiz</option>
                </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Date</label><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Max Marks</label><input required type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowResultModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Record Result</h2>
              <button onClick={() => setShowResultModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddResult} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input required value={resultForm.student_id} onChange={(e) => setResultForm({ ...resultForm, student_id: e.target.value })} placeholder="Enter student ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Marks Obtained</label><input required type="number" value={resultForm.marks_obtained} onChange={(e) => setResultForm({ ...resultForm, marks_obtained: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Grade</label><input value={resultForm.grade} onChange={(e) => setResultForm({ ...resultForm, grade: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowResultModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={resultSubmitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{resultSubmitting ? 'Saving...' : 'Add Result'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
