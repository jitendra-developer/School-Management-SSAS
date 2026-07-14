import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineCalendar } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { noticeService } from '@/services/noticeService'
import type { Notice } from '@/types/notice'

const categoryColors: Record<string, string> = {
  general: 'bg-slate-100 text-slate-700',
  academic: 'bg-blue-100 text-blue-700',
  exam: 'bg-purple-100 text-purple-700',
  holiday: 'bg-emerald-100 text-emerald-700',
  event: 'bg-amber-100 text-amber-700',
  sports: 'bg-cyan-100 text-cyan-700',
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [viewing, setViewing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'general', posted_by: '', publish_date: '', expiry_date: '' })

  useEffect(() => { fetchNotices() }, [])

  const fetchNotices = async () => {
    try {
      const { data } = await noticeService.getAll({ limit: '50' })
      setNotices(data.data?.notices || [])
    } catch { toast.error('Failed to load notices') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) { await noticeService.update(editing.id, form); toast.success('Notice updated') }
      else { await noticeService.create(form); toast.success('Notice created') }
      setShowModal(false); setEditing(null)
      setForm({ title: '', content: '', category: 'general', posted_by: '', publish_date: '', expiry_date: '' })
      fetchNotices()
    } catch { toast.error('Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleEdit = (n: Notice) => {
    setEditing(n)
    setForm({ title: n.title, content: n.content, category: n.category, posted_by: n.posted_by || '', publish_date: n.publish_date.split('T')[0], expiry_date: n.expiry_date ? n.expiry_date.split('T')[0] : '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return
    try { await noticeService.delete(id); toast.success('Notice deleted'); fetchNotices() }
    catch { toast.error('Delete failed') }
  }

  const filtered = notices.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notices</h1>
          <p className="mt-1 text-sm text-slate-500">Post and manage notices</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ title: '', content: '', category: 'general', posted_by: '', publish_date: '', expiry_date: '' }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Add Notice
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search notices..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Posted By</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Publish Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Expiry Date</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No notices found</td></tr>
              ) : filtered.map((n, i) => (
                <motion.tr key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewing(n)}>
                  <td className="px-4 py-3 font-medium text-slate-800">{n.title}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryColors[n.category] || 'bg-slate-100 text-slate-600'}`}>{n.category}</span></td>
                  <td className="px-4 py-3 text-slate-600">{n.posted_by || '—'}</td>
                  <td className="px-4 py-3 text-slate-600"><span className="inline-flex items-center gap-1"><HiOutlineCalendar className="h-3.5 w-3.5" />{new Date(n.publish_date).toLocaleDateString()}</span></td>
                  <td className="px-4 py-3 text-slate-600">{n.expiry_date ? new Date(n.expiry_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setViewing(n)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlineEye className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(n)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(n.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Notice' : 'Add Notice'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Category</label><select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="general">General</option><option value="academic">Academic</option><option value="exam">Exam</option><option value="holiday">Holiday</option><option value="event">Event</option><option value="sports">Sports</option>
                </select></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Content</label><textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Posted By</label><input value={form.posted_by} onChange={(e) => setForm({ ...form, posted_by: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Publish Date</label><input required type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</label><input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{viewing.title}</h2>
              <button onClick={() => setViewing(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryColors[viewing.category] || 'bg-slate-100 text-slate-600'}`}>{viewing.category}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><HiOutlineCalendar className="h-3.5 w-3.5" /> Published: {new Date(viewing.publish_date).toLocaleDateString()}</span>
                {viewing.expiry_date && <span className="text-xs text-slate-400 flex items-center gap-1"><HiOutlineCalendar className="h-3.5 w-3.5" /> Expires: {new Date(viewing.expiry_date).toLocaleDateString()}</span>}
                {viewing.posted_by && <span className="text-xs text-slate-400">Posted by: {viewing.posted_by}</span>}
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewing.content}</div>
              {viewing.attachment && (
                <a href={viewing.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">View Attachment</a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
