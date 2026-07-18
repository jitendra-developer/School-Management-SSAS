import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineTruck, HiOutlineUserGroup, HiOutlineEye } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { transportService } from '@/services/transportService'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import type { TransportRoute, TransportAssignment } from '@/types/transport'
import type { Student } from '@/types/student'
import type { Class } from '@/types/class'

type TabType = 'routes' | 'assignments'

export default function Transport() {
  const [tab, setTab] = useState<TabType>('routes')
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [assignments, setAssignments] = useState<TransportAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [assignSubmitting, setAssignSubmitting] = useState(false)
  const [editing, setEditing] = useState<TransportRoute | null>(null)
  const [routeForm, setRouteForm] = useState({ route_name: '', vehicle_number: '', driver_name: '', driver_phone: '' })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' })
  const [viewingRoute, setViewingRoute] = useState<TransportRoute | null>(null)
  const [viewingAssignment, setViewingAssignment] = useState<TransportAssignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<TransportAssignment | null>(null)
  const [editAssignForm, setEditAssignForm] = useState({ pickup_point: '', pickup_time: '', drop_time: '' })
  const [editAssignSubmitting, setEditAssignSubmitting] = useState(false)

  const [classes, setClasses] = useState<Class[]>([])
  const [studentQuery, setStudentQuery] = useState('')
  const [studentClassFilter, setStudentClassFilter] = useState('')
  const [studentResults, setStudentResults] = useState<Student[]>([])
  const [studentSearching, setStudentSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const studentSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchIdRef = useRef(0)

  useEffect(() => { tab === 'routes' ? fetchRoutes() : fetchAssignments() }, [tab])
  useEffect(() => { classService.getAll().then(({ data }) => setClasses(data.data || [])).catch(() => {}) }, [])

  const searchStudents = (query: string, classId: string) => {
    if (studentSearchTimer.current) clearTimeout(studentSearchTimer.current)
    if (!query.trim() && !classId) { setStudentResults([]); return }
    studentSearchTimer.current = setTimeout(async () => {
      setStudentSearching(true)
      try {
        const params: Record<string, string> = { limit: '8' }
        if (query.trim()) params.search = query.trim()
        if (classId) params.class_id = classId
        const { data } = await studentService.getAll(params)
        setStudentResults(data.data?.students || [])
      } catch { setStudentResults([]) }
      finally { setStudentSearching(false) }
    }, 300)
  }

  const handleStudentQueryChange = (value: string) => {
    setStudentQuery(value)
    setSelectedStudent(null)
    setAssignForm((f) => ({ ...f, student_id: '' }))
    setShowStudentDropdown(true)
    searchStudents(value, studentClassFilter)
  }

  const handleClassFilterChange = (value: string) => {
    setStudentClassFilter(value)
    setShowStudentDropdown(true)
    searchStudents(studentQuery, value)
  }

  const selectStudent = (s: Student) => {
    setSelectedStudent(s)
    setAssignForm((f) => ({ ...f, student_id: s.id }))
    setStudentQuery(`${s.first_name} ${s.last_name}`)
    setShowStudentDropdown(false)
  }

  const resetStudentPicker = () => {
    setStudentQuery(''); setStudentClassFilter(''); setStudentResults([]); setSelectedStudent(null); setShowStudentDropdown(false)
  }

  const fetchRoutes = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await transportService.getRoutes({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setRoutes(data.data || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load routes')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await transportService.getAssignments({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setAssignments(data.data?.assignments || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load assignments')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) { await transportService.updateRoute(editing.id, routeForm); toast.success('Route updated') }
      else { await transportService.createRoute(routeForm); toast.success('Route created') }
      setShowModal(false); setEditing(null)
      setRouteForm({ route_name: '', vehicle_number: '', driver_name: '', driver_phone: '' })
      fetchRoutes()
    } catch { toast.error('Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleRouteEdit = (r: TransportRoute) => {
    setEditing(r)
    setRouteForm({ route_name: r.route_name, vehicle_number: r.vehicle_number || '', driver_name: r.driver_name || '', driver_phone: r.driver_phone || '' })
    setShowModal(true)
  }

  const handleRouteDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return
    try { await transportService.deleteRoute(id); toast.success('Route deleted'); fetchRoutes() }
    catch { toast.error('Delete failed') }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignForm.student_id) { toast.error('Please select a student from the search results'); return }
    setAssignSubmitting(true)
    try {
      await transportService.assignStudent(assignForm)
      toast.success('Student assigned')
      setShowAssignModal(false)
      setAssignForm({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' })
      resetStudentPicker()
      fetchAssignments()
    } catch { toast.error('Assignment failed') }
    finally { setAssignSubmitting(false) }
  }

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm('Remove this assignment?')) return
    try { await transportService.removeAssignment(id); toast.success('Assignment removed'); fetchAssignments() }
    catch { toast.error('Remove failed') }
  }

  const openEditAssignment = (a: TransportAssignment) => {
    setEditingAssignment(a)
    setEditAssignForm({ pickup_point: a.pickup_point || '', pickup_time: a.pickup_time || '', drop_time: a.drop_time || '' })
  }

  const handleEditAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAssignment) return
    setEditAssignSubmitting(true)
    try {
      await transportService.updateAssignment(editingAssignment.id, editAssignForm)
      toast.success('Assignment updated')
      setEditingAssignment(null)
      fetchAssignments()
    } catch { toast.error('Update failed') }
    finally { setEditAssignSubmitting(false) }
  }

  const filteredRoutes = routes.filter((r) =>
    r.route_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.driver_name && r.driver_name.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredAssignments = assignments.filter((a) =>
    a.student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.route?.route_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transport</h1>
          <p className="mt-1 text-sm text-slate-500">Manage routes and student assignments</p>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab('routes')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'routes' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineTruck className="mr-1.5 inline-block h-4 w-4" /> Routes
            </button>
            <button onClick={() => setTab('assignments')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'assignments' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineUserGroup className="mr-1.5 inline-block h-4 w-4" /> Assignments
            </button>
          </div>
          {tab === 'routes' ? (
            <button onClick={() => { setEditing(null); setRouteForm({ route_name: '', vehicle_number: '', driver_name: '', driver_phone: '' }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Add Route
            </button>
          ) : (
            <button onClick={() => { setAssignForm({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' }); resetStudentPicker(); setShowAssignModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Assign Student
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={tab === 'routes' ? 'Search routes...' : 'Search assignments...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'routes' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Route Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Driver</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Students</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredRoutes.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No routes found</td></tr>
                ) : filteredRoutes.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.route_name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.vehicle_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.driver_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.driver_phone || '—'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700">{r._count?.assignments || 0}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingRoute(r)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => handleRouteEdit(r)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleRouteDelete(r.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Route</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Pickup Point</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Pickup Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Drop Time</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-28 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAssignments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No assignments found</td></tr>
                ) : filteredAssignments.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{a.student?.first_name?.[0]}{a.student?.last_name?.[0]}</div>
                        <span className="font-medium text-slate-800">{a.student?.first_name} {a.student?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.route?.route_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{a.pickup_point || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{a.pickup_time || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{a.drop_time || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingAssignment(a)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => openEditAssignment(a)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleRemoveAssignment(a.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Route' : 'Add Route'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleRouteSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Route Name</label><input required value={routeForm.route_name} onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Vehicle Number</label><input value={routeForm.vehicle_number} onChange={(e) => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Driver Name</label><input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Driver Phone</label><input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Assign Student</h2>
              <button onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAssign} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Route</label>
                <select required value={assignForm.route_id} onChange={(e) => setAssignForm({ ...assignForm, route_id: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Select route</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.route_name}{r.vehicle_number ? ` — ${r.vehicle_number}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-slate-700">Student</label>
                <div className="flex gap-2">
                  <select value={studentClassFilter} onChange={(e) => handleClassFilterChange(e.target.value)} className="w-28 shrink-0 rounded-lg border border-slate-200 px-2 py-2.5 text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                    <option value="">All classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                    ))}
                  </select>
                  <input
                    value={studentQuery}
                    onChange={(e) => handleStudentQueryChange(e.target.value)}
                    onFocus={() => setShowStudentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 150)}
                    placeholder="Search by name, roll no, phone..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                {showStudentDropdown && (studentQuery.trim() || studentClassFilter) && (
                  <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {studentSearching ? (
                      <div className="px-3 py-3 text-sm text-slate-400">Searching...</div>
                    ) : studentResults.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-400">No students found</div>
                    ) : studentResults.map((s) => (
                      <button type="button" key={s.id} onMouseDown={() => selectStudent(s)} className="flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-cyan-50">
                        <span className="text-sm font-medium text-slate-700">{s.first_name} {s.last_name}</span>
                        <span className="text-xs text-slate-400">
                          {s.class ? `${s.class.name}${s.class.section ? ' - ' + s.class.section : ''}` : 'No class'}
                          {s.roll_number ? ` • Roll ${s.roll_number}` : ''}
                          {s.parent_phone ? ` • ${s.parent_phone}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedStudent && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Selected: {selectedStudent.first_name} {selectedStudent.last_name}
                    {selectedStudent.class ? ` (${selectedStudent.class.name}${selectedStudent.class.section ? '-' + selectedStudent.class.section : ''}${selectedStudent.roll_number ? `, Roll ${selectedStudent.roll_number}` : ''})` : ''}
                  </p>
                )}
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Point</label><input value={assignForm.pickup_point} onChange={(e) => setAssignForm({ ...assignForm, pickup_point: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Time</label><input type="time" value={assignForm.pickup_time} onChange={(e) => setAssignForm({ ...assignForm, pickup_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Drop Time</label><input type="time" value={assignForm.drop_time} onChange={(e) => setAssignForm({ ...assignForm, drop_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={assignSubmitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{assignSubmitting ? 'Saving...' : 'Assign'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingRoute(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Route Details</h2>
              <button onClick={() => setViewingRoute(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Route Name</p><p className="font-medium text-slate-700">{viewingRoute.route_name}</p></div>
                <div><p className="text-slate-400">Vehicle Number</p><p className="font-medium text-slate-700">{viewingRoute.vehicle_number || '—'}</p></div>
                <div><p className="text-slate-400">Driver Name</p><p className="font-medium text-slate-700">{viewingRoute.driver_name || '—'}</p></div>
                <div><p className="text-slate-400">Driver Phone</p><p className="font-medium text-slate-700">{viewingRoute.driver_phone || '—'}</p></div>
                <div><p className="text-slate-400">Students Assigned</p><p className="font-medium text-slate-700">{viewingRoute._count?.assignments || 0}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingRoute(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingAssignment(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Assignment Details</h2>
              <button onClick={() => setViewingAssignment(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Student</p><p className="font-medium text-slate-700">{viewingAssignment.student?.first_name} {viewingAssignment.student?.last_name}</p></div>
                <div><p className="text-slate-400">Route</p><p className="font-medium text-slate-700">{viewingAssignment.route?.route_name || '—'}</p></div>
                <div><p className="text-slate-400">Pickup Point</p><p className="font-medium text-slate-700">{viewingAssignment.pickup_point || '—'}</p></div>
                <div><p className="text-slate-400">Pickup Time</p><p className="font-medium text-slate-700">{viewingAssignment.pickup_time || '—'}</p></div>
                <div><p className="text-slate-400">Drop Time</p><p className="font-medium text-slate-700">{viewingAssignment.drop_time || '—'}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingAssignment(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingAssignment(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Assignment</h2>
              <button onClick={() => setEditingAssignment(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditAssignmentSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <p className="text-sm text-slate-500">{editingAssignment.student?.first_name} {editingAssignment.student?.last_name} — {editingAssignment.route?.route_name}</p>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Point</label><input value={editAssignForm.pickup_point} onChange={(e) => setEditAssignForm({ ...editAssignForm, pickup_point: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Time</label><input type="time" value={editAssignForm.pickup_time} onChange={(e) => setEditAssignForm({ ...editAssignForm, pickup_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Drop Time</label><input type="time" value={editAssignForm.drop_time} onChange={(e) => setEditAssignForm({ ...editAssignForm, drop_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingAssignment(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={editAssignSubmitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{editAssignSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
