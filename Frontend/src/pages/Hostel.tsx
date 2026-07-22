import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineHome, HiOutlineKey, HiOutlineUserGroup, HiOutlineLogout, HiOutlineEye } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { hostelService } from '@/services/hostelService'
import type { Hostel, Room, RoomAssignment } from '@/types/hostel'

type TabType = 'hostels' | 'rooms' | 'assignments'

export default function Hostel() {
  const [tab, setTab] = useState<TabType>('hostels')
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [assignments, setAssignments] = useState<RoomAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedHostelId, setSelectedHostelId] = useState('')

  const [showHostelModal, setShowHostelModal] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [hostelForm, setHostelForm] = useState({ name: '', warden_name: '', warden_phone: '', total_rooms: '10' })

  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({ hostel_id: '', room_number: '', capacity: '2', occupants: '0' })

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ room_id: '', student_id: '' })

  const [viewingHostel, setViewingHostel] = useState<Hostel | null>(null)
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null)
  const [viewingAssignment, setViewingAssignment] = useState<RoomAssignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<RoomAssignment | null>(null)
  const [editAssignForm, setEditAssignForm] = useState({ check_in_date: '', check_out_date: '' })
  const [editAssignSubmitting, setEditAssignSubmitting] = useState(false)

  const fetchIdRef = useRef(0)

  useEffect(() => {
    if (tab === 'hostels') fetchHostels()
    else if (tab === 'rooms') fetchRooms()
    else fetchAssignments()
  }, [tab])

  const fetchHostels = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await hostelService.getHostels({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setHostels(data.data?.hostels || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load hostels')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const fetchRooms = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      if (selectedHostelId) {
        const { data } = await hostelService.getRooms(selectedHostelId, { limit: '50' })
        if (requestId !== fetchIdRef.current) return
        setRooms(data.data?.rooms || [])
      } else {
        if (requestId !== fetchIdRef.current) return
        setRooms([])
      }
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load rooms')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  useEffect(() => { if (tab === 'rooms') fetchRooms() }, [selectedHostelId])

  const fetchAssignments = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await hostelService.getAssignments({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setAssignments(data.data?.assignments || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load assignments')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const handleHostelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...hostelForm, total_rooms: parseInt(hostelForm.total_rooms) }
      if (editingHostel) { await hostelService.updateHostel(editingHostel.id, payload); toast.success('Hostel updated') }
      else { await hostelService.createHostel(payload); toast.success('Hostel created') }
      setShowHostelModal(false); setEditingHostel(null)
      setHostelForm({ name: '', warden_name: '', warden_phone: '', total_rooms: '10' })
      fetchHostels()
    } catch { toast.error('Operation failed') }
  }

  const handleHostelEdit = (h: Hostel) => {
    setEditingHostel(h)
    setHostelForm({ name: h.name, warden_name: h.warden_name || '', warden_phone: h.warden_phone || '', total_rooms: String(h.total_rooms) })
    setShowHostelModal(true)
  }

  const handleHostelDelete = async (id: string) => {
    if (!confirm('Delete this hostel?')) return
    try { await hostelService.deleteHostel(id); toast.success('Hostel deleted'); fetchHostels() }
    catch { toast.error('Delete failed') }
  }

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...roomForm, capacity: parseInt(roomForm.capacity), occupants: parseInt(roomForm.occupants) }
      if (editingRoom) { await hostelService.updateRoom(editingRoom.id, payload); toast.success('Room updated') }
      else { await hostelService.createRoom(payload); toast.success('Room created') }
      setShowRoomModal(false); setEditingRoom(null)
      setRoomForm({ hostel_id: selectedHostelId || '', room_number: '', capacity: '2', occupants: '0' })
      fetchRooms()
    } catch { toast.error('Operation failed') }
  }

  const handleRoomEdit = (r: Room) => {
    setEditingRoom(r)
    setRoomForm({ hostel_id: r.hostel_id, room_number: r.room_number, capacity: String(r.capacity), occupants: String(r.occupants) })
    setShowRoomModal(true)
  }

  const handleRoomDelete = async (id: string) => {
    if (!confirm('Delete this room?')) return
    try { await hostelService.deleteRoom(id); toast.success('Room deleted'); fetchRooms() }
    catch { toast.error('Delete failed') }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await hostelService.assignStudent(assignForm)
      toast.success('Student assigned')
      setShowAssignModal(false)
      setAssignForm({ room_id: '', student_id: '' })
      fetchAssignments()
    } catch { toast.error('Assignment failed') }
  }

  const handleCheckout = async (id: string) => {
    if (!confirm('Check out this student?')) return
    try { await hostelService.removeAssignment(id); toast.success('Student checked out'); fetchAssignments() }
    catch { toast.error('Checkout failed') }
  }

  const openEditAssignment = (a: RoomAssignment) => {
    setEditingAssignment(a)
    setEditAssignForm({
      check_in_date: a.check_in_date.split('T')[0],
      check_out_date: a.check_out_date ? a.check_out_date.split('T')[0] : '',
    })
  }

  const handleEditAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAssignment) return
    setEditAssignSubmitting(true)
    try {
      await hostelService.updateAssignment(editingAssignment.id, {
        check_in_date: editAssignForm.check_in_date,
        check_out_date: editAssignForm.check_out_date || null,
      })
      toast.success('Assignment updated')
      setEditingAssignment(null)
      fetchAssignments()
    } catch { toast.error('Update failed') }
    finally { setEditAssignSubmitting(false) }
  }

  const filteredHostels = hostels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.warden_name && h.warden_name.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredRooms = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(search.toLowerCase())
  )

  const filteredAssignments = assignments.filter((a) =>
    a.student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.room?.room_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hostel</h1>
          <p className="mt-1 text-sm text-slate-500">Manage hostels, rooms, and assignments</p>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab('hostels')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'hostels' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineHome className="mr-1.5 inline-block h-4 w-4" /> Hostels
            </button>
            <button onClick={() => setTab('rooms')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'rooms' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineKey className="mr-1.5 inline-block h-4 w-4" /> Rooms
            </button>
            <button onClick={() => setTab('assignments')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'assignments' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineUserGroup className="mr-1.5 inline-block h-4 w-4" /> Assignments
            </button>
          </div>
          {tab === 'hostels' && (
            <button onClick={() => { setEditingHostel(null); setHostelForm({ name: '', warden_name: '', warden_phone: '', total_rooms: '10' }); setShowHostelModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Add Hostel
            </button>
          )}
          {tab === 'rooms' && (
            <button onClick={() => { setEditingRoom(null); setRoomForm({ hostel_id: selectedHostelId, room_number: '', capacity: '2', occupants: '0' }); setShowRoomModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Add Room
            </button>
          )}
          {tab === 'assignments' && (
            <button onClick={() => { setAssignForm({ room_id: '', student_id: '' }); setShowAssignModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Assign Student
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={
              tab === 'hostels' ? 'Search hostels...' :
              tab === 'rooms' ? 'Search rooms...' : 'Search assignments...'
            } value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          {tab === 'rooms' && (
            <select value={selectedHostelId} onChange={(e) => setSelectedHostelId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
              <option value="">Select Hostel</option>
              {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'hostels' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Warden</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Rooms</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Total Rooms</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-10 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredHostels.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No hostels found</td></tr>
                ) : filteredHostels.map((h, i) => (
                  <motion.tr key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{h.name}</td>
                    <td className="px-4 py-3 text-slate-600">{h.warden_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{h.warden_phone || '—'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{h._count?.rooms || 0}</span></td>
                    <td className="px-4 py-3 text-slate-600">{h.total_rooms}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingHostel(h)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => handleHostelEdit(h)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleHostelDelete(h.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'rooms' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Room</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Hostel</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Capacity</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Occupants</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Available</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-10 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredRooms.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No rooms found</td></tr>
                ) : filteredRooms.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.room_number}</td>
                    <td className="px-4 py-3 text-slate-600">{r.hostel?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.capacity}</td>
                    <td className="px-4 py-3 text-slate-600">{r.occupants}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.capacity - r.occupants > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{r.capacity - r.occupants}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingRoom(r)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => handleRoomEdit(r)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleRoomDelete(r.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'assignments' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Room</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Hostel</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Check In</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Check Out</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
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
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAssignments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No assignments found</td></tr>
                ) : filteredAssignments.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-xs font-bold text-white">{a.student?.first_name?.[0]}{a.student?.last_name?.[0]}</div>
                        <span className="font-medium text-slate-800">{a.student?.first_name} {a.student?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.room?.room_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{a.room?.hostel?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(a.check_in_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{a.check_out_date ? new Date(a.check_out_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingAssignment(a)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => openEditAssignment(a)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      {!a.check_out_date && (
                        <button onClick={() => handleCheckout(a.id)} className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors">
                          <HiOutlineLogout className="h-3.5 w-3.5" /> Check Out
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {showHostelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowHostelModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editingHostel ? 'Edit Hostel' : 'Add Hostel'}</h2>
              <button onClick={() => setShowHostelModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleHostelSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Name</label><input required value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Warden Name</label><input value={hostelForm.warden_name} onChange={(e) => setHostelForm({ ...hostelForm, warden_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Warden Phone</label><input value={hostelForm.warden_phone} onChange={(e) => setHostelForm({ ...hostelForm, warden_phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Total Rooms</label><input required type="number" min="1" value={hostelForm.total_rooms} onChange={(e) => setHostelForm({ ...hostelForm, total_rooms: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowHostelModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editingHostel ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowRoomModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
              <button onClick={() => setShowRoomModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleRoomSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Hostel ID</label><input required value={roomForm.hostel_id} onChange={(e) => setRoomForm({ ...roomForm, hostel_id: e.target.value })} placeholder="Enter hostel ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Room Number</label><input required value={roomForm.room_number} onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label><input required type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Occupants</label><input required type="number" min="0" value={roomForm.occupants} onChange={(e) => setRoomForm({ ...roomForm, occupants: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRoomModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editingRoom ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Assign Student</h2>
              <button onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAssign} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Room ID</label><input required value={assignForm.room_id} onChange={(e) => setAssignForm({ ...assignForm, room_id: e.target.value })} placeholder="Enter room ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input required value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} placeholder="Enter student ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">Assign</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewingHostel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingHostel(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Hostel Details</h2>
              <button onClick={() => setViewingHostel(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Name</p><p className="font-medium text-slate-700">{viewingHostel.name}</p></div>
                <div><p className="text-slate-400">Warden Name</p><p className="font-medium text-slate-700">{viewingHostel.warden_name || '—'}</p></div>
                <div><p className="text-slate-400">Warden Phone</p><p className="font-medium text-slate-700">{viewingHostel.warden_phone || '—'}</p></div>
                <div><p className="text-slate-400">Total Rooms</p><p className="font-medium text-slate-700">{viewingHostel.total_rooms}</p></div>
                <div><p className="text-slate-400">Rooms Created</p><p className="font-medium text-slate-700">{viewingHostel._count?.rooms || 0}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingHostel(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {viewingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingRoom(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Room Details</h2>
              <button onClick={() => setViewingRoom(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Room Number</p><p className="font-medium text-slate-700">{viewingRoom.room_number}</p></div>
                <div><p className="text-slate-400">Hostel</p><p className="font-medium text-slate-700">{viewingRoom.hostel?.name || '—'}</p></div>
                <div><p className="text-slate-400">Capacity</p><p className="font-medium text-slate-700">{viewingRoom.capacity}</p></div>
                <div><p className="text-slate-400">Occupants</p><p className="font-medium text-slate-700">{viewingRoom.occupants}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingRoom(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
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
                <div><p className="text-slate-400">Room</p><p className="font-medium text-slate-700">{viewingAssignment.room?.room_number || '—'}</p></div>
                <div><p className="text-slate-400">Hostel</p><p className="font-medium text-slate-700">{viewingAssignment.room?.hostel?.name || '—'}</p></div>
                <div><p className="text-slate-400">Check In</p><p className="font-medium text-slate-700">{new Date(viewingAssignment.check_in_date).toLocaleDateString()}</p></div>
                <div><p className="text-slate-400">Check Out</p><p className="font-medium text-slate-700">{viewingAssignment.check_out_date ? new Date(viewingAssignment.check_out_date).toLocaleDateString() : '—'}</p></div>
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
              <p className="text-sm text-slate-500">{editingAssignment.student?.first_name} {editingAssignment.student?.last_name} — Room {editingAssignment.room?.room_number}</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Check In Date</label><input required type="date" value={editAssignForm.check_in_date} onChange={(e) => setEditAssignForm({ ...editAssignForm, check_in_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Check Out Date</label><input type="date" value={editAssignForm.check_out_date} onChange={(e) => setEditAssignForm({ ...editAssignForm, check_out_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingAssignment(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={editAssignSubmitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{editAssignSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
