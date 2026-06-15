import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineAcademicCap, HiOutlineChevronRight, HiOutlineUsers, HiOutlinePlus, HiOutlineX, HiOutlineTrash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { classService } from '@/services/classService'
import type { Class } from '@/types/class'

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', section: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    try {
      const { data } = await classService.getAll()
      setClasses(data.data || [])
    } catch { toast.error('Failed to load classes') }
    finally { setLoading(false) }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      await classService.create({ name: form.name.trim(), section: form.section.trim() || undefined })
      toast.success('Class created')
      setShowModal(false)
      setForm({ name: '', section: '' })
      fetchClasses()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create class'
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
          onClick={() => { setForm({ name: '', section: '' }); setShowModal(true) }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02]"
        >
          <HiOutlinePlus className="h-4 w-4" /> Add Class
        </button>
      </motion.div>

      {loading ? (
        <div className="glass-card rounded-xl p-12 text-center text-slate-400">Loading...</div>
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
            >
              <div className="glass-card group relative flex items-center gap-4 rounded-xl p-5 transition-all hover:shadow-lg">
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
                  <p className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <HiOutlineUsers className="h-4 w-4" />
                    {cls._count.students} student{cls._count.students !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-1">
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add Class</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
