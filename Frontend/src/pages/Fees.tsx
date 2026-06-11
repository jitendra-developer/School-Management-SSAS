import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineCheck } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { feeService } from '@/services/feeService'
import type { Fee } from '@/types/fee'

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-red-100 text-red-700',
}

export default function Fees() {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [assignForm, setAssignForm] = useState({ student_id: '', plan_id: '', amount: '', due_date: '' })

  useEffect(() => { fetchFees() }, [])

  const fetchFees = async () => {
    try {
      const { data } = await feeService.getAll({ limit: '50' })
      setFees(data.data?.fees || [])
    } catch { toast.error('Failed to load fees') }
    finally { setLoading(false) }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await feeService.assignFee(assignForm)
      toast.success('Fee assigned')
      setShowAssignModal(false)
      setAssignForm({ student_id: '', plan_id: '', amount: '', due_date: '' })
      fetchFees()
    } catch { toast.error('Failed to assign fee') }
  }

  const handlePay = async (feeId: string) => {
    if (!payAmount || parseFloat(payAmount) <= 0) { toast.error('Enter valid amount'); return }
    try {
      await feeService.recordPayment(feeId, { paid: parseFloat(payAmount), payment_method: 'cash' })
      toast.success('Payment recorded')
      setShowPayModal(null)
      setPayAmount('')
      fetchFees()
    } catch { toast.error('Payment failed') }
  }

  const filtered = fees.filter((f) =>
    (f.student?.first_name && f.student.first_name.toLowerCase().includes(search.toLowerCase())) ||
    (f.student?.last_name && f.student.last_name.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPending = fees.filter((f) => f.status !== 'paid').reduce((s, f) => s + (f.amount - f.paid), 0)
  const totalCollected = fees.reduce((s, f) => s + f.paid, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fees Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage fee collections</p>
        </div>
        <button onClick={() => setShowAssignModal(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePlus className="h-4 w-4" /> Assign Fee
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-medium text-slate-500">Total Collected</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">₹{totalCollected.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-medium text-slate-500">Pending Amount</p>
          <p className="mt-2 text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-medium text-slate-500">Total Records</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{fees.length}</p>
        </motion.div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by student name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Paid</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Due</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No fee records found</td></tr>
              ) : filtered.map((f, i) => (
                <motion.tr key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">{f.student?.first_name?.[0]}{f.student?.last_name?.[0]}</div>
                      <div><p className="font-medium text-slate-800">{f.student?.first_name} {f.student?.last_name}</p><p className="text-xs text-slate-400">{f.class?.name}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">₹{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-600">₹{f.paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">₹{(f.amount - f.paid).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[f.status]}`}>{f.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {f.status !== 'paid' && (
                      <button onClick={() => { setShowPayModal(f.id); setPayAmount(String(f.amount - f.paid)) }} className="cursor-pointer rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors">Pay</button>
                    )}
                    {f.status === 'paid' && <span className="text-xs text-emerald-600"><HiOutlineCheck className="inline h-4 w-4" /> Paid</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Assign Fee</h2>
              <button onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input required value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} placeholder="Enter student ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Amount</label><input required type="number" value={assignForm.amount} onChange={(e) => setAssignForm({ ...assignForm, amount: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label><input required type="date" value={assignForm.due_date} onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">Assign</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPayModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setShowPayModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Amount</label><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPayModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={() => handlePay(showPayModal)} className="cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">Pay Now</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
