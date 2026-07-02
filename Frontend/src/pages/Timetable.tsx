import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { timetableService } from '@/services/timetableService'
import type { TimetableEntry } from '@/types/timetable'

const DAY_NAMES: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }

export default function Timetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TimetableEntry | null>(null)
  const [form, setForm] = useState({ class_id: '', teacher_id: '', day_of_week: '1', subject: '', start_time: '', end_time: '', room: '' })

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    try {
      const params: Record<string, string> = { limit: '50' }
      if (filterDay) params.day = filterDay
      const { data } = await timetableService.getAll(params)
      setEntries(data.data?.timetable || [])
    } catch { toast.error('Failed to load timetable') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEntries() }, [filterDay])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form, day_of_week: parseInt(form.day_of_week) }
      if (editing) { await timetableService.update(editing.id, payload); toast.success('Entry updated') }
      else { await timetableService.create(payload); toast.success('Entry created') }
      setShowModal(false); setEditing(null)
      setForm({ class_id: '', teacher_id: '', day_of_week: '1', subject: '', start_time: '', end_time: '', room: '' })
      fetchEntries()
    } catch { toast.error('Operation failed') }
  }

  const handleEdit = (t: TimetableEntry) => {
    setEditing(t)
    setForm({ class_id: t.class_id, teacher_id: t.teacher_id || '', day_of_week: String(t.day_of_week), subject: t.subject, start_time: t.start_time, end_time: t.end_time, room: t.room || '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this timetable entry?')) return
    try { await timetableService.delete(id); toast.success('Entry deleted'); fetchEntries() }
    catch { toast.error('Delete failed') }
  }

  const filtered = entries.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    (t.class?.name && t.class.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timetable</h1>
          <p className="mt-1 text-sm text-slate-500">Manage class schedules</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ class_id: '', teacher_id: '', day_of_week: '1', subject: '', start_time: '', end_time: '', room: '' }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Add Entry
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by subject or class..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
            <option value="">All Days</option>
            {[1,2,3,4,5,6,7].map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Day</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Teacher</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Room</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No entries found</td></tr>
              ) : filtered.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3"><span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">{DAY_NAMES[t.day_of_week] || `Day ${t.day_of_week}`}</span></td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.subject}</td>
                  <td className="px-4 py-3 text-slate-600">{t.class?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.teacher ? `${t.teacher.first_name} ${t.teacher.last_name}` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.start_time} - {t.end_time}</td>
                  <td className="px-4 py-3 text-slate-600">{t.room || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(t)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Entry' : 'Add Timetable Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Class ID</label><input required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} placeholder="Enter class ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Teacher ID</label><input value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} placeholder="Enter teacher ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Day of Week</label><select required value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  {[1,2,3,4,5,6,7].map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
                </select></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Start Time</label><input required type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">End Time</label><input required type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Room</label><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
