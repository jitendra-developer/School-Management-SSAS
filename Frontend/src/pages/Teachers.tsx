import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { teacherService } from '@/services/teacherService'
import { classService } from '@/services/classService'
import type { Teacher } from '@/types/teacher'
import type { Class } from '@/types/class'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
}

const defaultForm = {
  first_name: '', last_name: '', email: '', phone: '',
  subject: '', qualification: '', gender: '', class_id: '', password: '',
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewing, setViewing] = useState<Teacher | null>(null)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { fetchTeachers(); fetchClasses() }, [])

  const fetchTeachers = async () => {
    try {
      const { data } = await teacherService.getAll({ limit: '50' })
      setTeachers(data.data?.teachers || [])
    } catch { toast.error('Failed to load teachers') }
    finally { setLoading(false) }
  }

  const fetchClasses = async () => {
    try {
      const { data } = await classService.getAll()
      setClasses(data.data || [])
    } catch { /* non-critical */ }
  }

  const openCreate = () => {
    setEditing(null); setForm(defaultForm); setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.class_id) {
      delete payload.class_id
      delete payload.password
    }
    try {
      if (editing) { await teacherService.update(editing.id, payload); toast.success('Teacher updated') }
      else { await teacherService.create(payload); toast.success('Teacher created') }
      setShowModal(false); setEditing(null); setForm(defaultForm)
      fetchTeachers()
    } catch { toast.error('Operation failed') }
  }

  const handleEdit = (t: Teacher) => {
    setEditing(t)
    setForm({
      first_name: t.first_name, last_name: t.last_name,
      email: t.email || '', phone: t.phone || '',
      subject: t.subject || '', qualification: t.qualification || '',
      gender: t.gender || '', class_id: t.class_id || '', password: '',
    })
    setShowModal(true)
  }

  const handleView = (t: Teacher) => {
    setViewing(t); setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    try { await teacherService.delete(id); toast.success('Teacher deleted'); fetchTeachers() }
    catch { toast.error('Delete failed') }
  }

  const filtered = teachers.filter((t) =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage teaching staff</p>
        </div>
        <button onClick={openCreate} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Add Teacher
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No teachers found</td></tr>
              ) : filtered.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">{t.first_name[0]}{t.last_name[0]}</div>
                      <div><p className="font-medium text-slate-800">{t.first_name} {t.last_name}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.subject || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.class ? `${t.class.name}${t.class.section ? ` (${t.class.section})` : ''}` : '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[t.status] || 'bg-slate-100 text-slate-600'}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleView(t)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><HiOutlineEye className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(t)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">First Name</label><input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label><input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Qualification</label><input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Gender</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
                </select></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Class <span className="text-xs text-slate-400">(class teacher)</span></label><select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Not assigned</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</option>)}
                </select></div>
              </div>
              {form.class_id && (
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Password {!editing && <span className="text-red-500">*</span>}</label><div className="relative"><input type={showPassword ? 'text' : 'password'} required={!editing && !!form.class_id} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-slate-400 hover:text-slate-600">{showPassword ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}</button></div></div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Teacher Details</h2>
              <button onClick={() => setShowViewModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white">{viewing.first_name[0]}{viewing.last_name[0]}</div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{viewing.first_name} {viewing.last_name}</p>
                  <p className="text-sm text-slate-500">{viewing.subject || 'No subject'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-slate-400">Email</span><span className="text-slate-700">{viewing.email || '—'}</span></div>
                <div><span className="block text-slate-400">Phone</span><span className="text-slate-700">{viewing.phone || '—'}</span></div>
                <div><span className="block text-slate-400">Qualification</span><span className="text-slate-700">{viewing.qualification || '—'}</span></div>
                <div><span className="block text-slate-400">Gender</span><span className="text-slate-700 capitalize">{viewing.gender || '—'}</span></div>
                <div><span className="block text-slate-400">Class Teacher</span><span className="text-slate-700">{viewing.class ? `${viewing.class.name}${viewing.class.section ? ` (${viewing.class.section})` : ''}` : 'Not assigned'}</span></div>
                <div><span className="block text-slate-400">Status</span><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[viewing.status] || 'bg-slate-100 text-slate-600'}`}>{viewing.status}</span></div>
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={() => setShowViewModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
