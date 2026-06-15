import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineTruck, HiOutlineUserGroup } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { transportService } from '@/services/transportService'
import type { TransportRoute, TransportAssignment } from '@/types/transport'

type TabType = 'routes' | 'assignments'

export default function Transport() {
  const [tab, setTab] = useState<TabType>('routes')
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [assignments, setAssignments] = useState<TransportAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TransportRoute | null>(null)
  const [routeForm, setRouteForm] = useState({ route_name: '', vehicle_number: '', driver_name: '', driver_phone: '' })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' })

  useEffect(() => { tab === 'routes' ? fetchRoutes() : fetchAssignments() }, [tab])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const { data } = await transportService.getRoutes({ limit: '50' })
      setRoutes(data.data?.routes || [])
    } catch { toast.error('Failed to load routes') }
    finally { setLoading(false) }
  }

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const { data } = await transportService.getAssignments({ limit: '50' })
      setAssignments(data.data?.assignments || [])
    } catch { toast.error('Failed to load assignments') }
    finally { setLoading(false) }
  }

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) { await transportService.updateRoute(editing.id, routeForm); toast.success('Route updated') }
      else { await transportService.createRoute(routeForm); toast.success('Route created') }
      setShowModal(false); setEditing(null)
      setRouteForm({ route_name: '', vehicle_number: '', driver_name: '', driver_phone: '' })
      fetchRoutes()
    } catch { toast.error('Operation failed') }
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
    try {
      await transportService.assignStudent(assignForm)
      toast.success('Student assigned')
      setShowAssignModal(false)
      setAssignForm({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' })
      fetchAssignments()
    } catch { toast.error('Assignment failed') }
  }

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm('Remove this assignment?')) return
    try { await transportService.removeAssignment(id); toast.success('Assignment removed'); fetchAssignments() }
    catch { toast.error('Remove failed') }
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
            <button onClick={() => { setAssignForm({ route_id: '', student_id: '', pickup_point: '', pickup_time: '', drop_time: '' }); setShowAssignModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
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
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
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
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Route' : 'Add Route'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Route Name</label><input required value={routeForm.route_name} onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Vehicle Number</label><input value={routeForm.vehicle_number} onChange={(e) => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Driver Name</label><input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Driver Phone</label><input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Assign Student</h2>
              <button onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Route ID</label><input required value={assignForm.route_id} onChange={(e) => setAssignForm({ ...assignForm, route_id: e.target.value })} placeholder="Enter route ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input required value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} placeholder="Enter student ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Point</label><input value={assignForm.pickup_point} onChange={(e) => setAssignForm({ ...assignForm, pickup_point: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Pickup Time</label><input type="time" value={assignForm.pickup_time} onChange={(e) => setAssignForm({ ...assignForm, pickup_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Drop Time</label><input type="time" value={assignForm.drop_time} onChange={(e) => setAssignForm({ ...assignForm, drop_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">Assign</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
