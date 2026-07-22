import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineCheck,
  HiOutlineViewList, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineUsers, HiOutlineFilter, HiOutlineClock, HiOutlinePrinter, HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { feeService } from '@/services/feeService'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import { useAuth } from '@/context/AuthContext'
import type { Fee, FeePlan, FeePayment, FeeCategory, PlanCategory } from '@/types/fee'
import type { Student } from '@/types/student'
import type { Class } from '@/types/class'

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-red-100 text-red-700',
}

const categoryColors: Record<string, string> = {
  tuition: 'bg-indigo-100 text-indigo-700',
  transport: 'bg-sky-100 text-sky-700',
  exam: 'bg-violet-100 text-violet-700',
  other: 'bg-slate-100 text-slate-600',
  total: 'bg-emerald-100 text-emerald-700',
}

const categoryOptions: { value: FeeCategory; label: string }[] = [
  { value: 'tuition', label: 'Class Fee' },
  { value: 'transport', label: 'Transport' },
  { value: 'exam', label: 'Exam' },
  { value: 'other', label: 'Other' },
]

const planCategoryOptions: { value: PlanCategory; label: string }[] = [
  ...categoryOptions,
  { value: 'total', label: 'Total Fee' },
]

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online Payment' },
]

type FeeTab = 'all' | 'paid' | 'partial' | 'pending'

export default function Fees() {
  const { admin } = useAuth()
  const schoolName = admin?.school?.school_name || 'School'
  const [fees, setFees] = useState<Fee[]>([])
  const [plans, setPlans] = useState<FeePlan[]>([])
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<FeeTab>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPlansList, setShowPlansList] = useState(false)

  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payRemark, setPayRemark] = useState('')
  const [payReceiptNumber, setPayReceiptNumber] = useState('')
  const [paying, setPaying] = useState(false)

  const [receiptData, setReceiptData] = useState<{ fee: Fee; payment: FeePayment } | null>(null)
  const [historyFeeId, setHistoryFeeId] = useState<string | null>(null)
  const [historyPayments, setHistoryPayments] = useState<FeePayment[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [editAmounts, setEditAmounts] = useState<Record<FeeCategory, string>>({ tuition: '', transport: '', exam: '', other: '' })
  const [editDueDate, setEditDueDate] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [planForm, setPlanForm] = useState({ name: '', amount: '', frequency: 'monthly', category: 'tuition' as PlanCategory, description: '' })
  const [editingPlan, setEditingPlan] = useState<FeePlan | null>(null)
  const [savingPlan, setSavingPlan] = useState(false)

  const [assignStep, setAssignStep] = useState<'class' | 'students' | 'confirm'>('class')
  const [assignClassId, setAssignClassId] = useState('')
  const [classFeeAmount, setClassFeeAmount] = useState<number | null>(null)
  const [classStudents, setClassStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentLoading, setStudentLoading] = useState(false)
  const [assignAmounts, setAssignAmounts] = useState<Record<FeeCategory, string>>({ tuition: '', transport: '', exam: '', other: '' })
  const [assignDueDate, setAssignDueDate] = useState('')
  const [assigning, setAssigning] = useState(false)

  const LIMIT = 15
  const fetchIdRef = useRef(0)

  const fetchFees = useCallback(async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const params: Record<string, string> = { limit: String(LIMIT), page: String(page) }
      if (statusFilter !== 'all') params.status = statusFilter
      if (classFilter) params.class_id = classFilter
      if (search.trim()) params.search = search.trim()
      const { data } = await feeService.getAll(params)
      if (requestId !== fetchIdRef.current) return
      setFees(data.data?.fees || [])
      setTotalPages(data.data?.totalPages || 1)
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load fees')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }, [page, statusFilter, classFilter, search])

  useEffect(() => { fetchFees() }, [fetchFees])

  useEffect(() => {
    feeService.getPlans().then(({ data }) => setPlans(data.data || [])).catch(() => {})
    classService.getAll().then(({ data }) => setAllClasses(data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!showPlansList) return
    feeService.getPlans().then(({ data }) => setPlans(data.data || [])).catch(() => {})
  }, [showPlansList])

  const loadClassStudents = async (classId: string) => {
    if (!classId) { setClassStudents([]); return }
    setStudentLoading(true)
    try {
      const { data } = await studentService.getAll({ class_id: classId, limit: '500', status: 'active' })
      setClassStudents(data.data?.students || [])
    } catch { toast.error('Failed to load students') }
    finally { setStudentLoading(false) }
  }

  const filteredStudents = classStudents.filter((s) => {
    if (!studentSearch.trim()) return true
    const q = studentSearch.toLowerCase()
    return (
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.roll_number?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
    )
  })

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id))
    }
  }

  const openAssign = () => {
    setAssignStep('class')
    setAssignClassId('')
    setClassFeeAmount(null)
    setClassStudents([])
    setSelectedStudents([])
    setStudentSearch('')
    setAssignAmounts({ tuition: '', transport: '', exam: '', other: '' })
    setAssignDueDate('')
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async () => {
    if (selectedStudents.length === 0) { toast.error('Select at least one student'); return }
    const active = categoryOptions.filter((c) => parseFloat(assignAmounts[c.value] || '0') > 0)
    if (active.length === 0) { toast.error('Enter an amount for at least one fee category'); return }
    if (!assignDueDate) { toast.error('Select due date'); return }
    setAssigning(true)
    try {
      const { data } = await feeService.assignFeeBatch({
        student_ids: selectedStudents,
        amounts: {
          tuition: assignAmounts.tuition || undefined,
          transport: assignAmounts.transport || undefined,
          exam: assignAmounts.exam || undefined,
          other: assignAmounts.other || undefined,
        },
        due_date: assignDueDate,
      })
      const created = data.data?.created || 0
      const updated = data.data?.updated || 0
      const invalid = data.data?.invalid || 0
      const parts = []
      if (created) parts.push(`${created} assigned`)
      if (updated) parts.push(`${updated} updated`)
      if (invalid) parts.push(`${invalid} skipped (total below what's already paid)`)
      toast.success(parts.join(', ') || 'Fee assignment complete')
      setShowAssignModal(false)
      fetchFees()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to assign fee'
      toast.error(msg)
    } finally { setAssigning(false) }
  }

  const handlePay = async (feeId: string) => {
    if (!payAmount || parseFloat(payAmount) <= 0) { toast.error('Enter valid amount'); return }
    const fee = fees.find((f) => f.id === feeId)
    const remaining = fee ? fee.amount - fee.paid : Infinity
    if (parseFloat(payAmount) > remaining) { toast.error(`Amount exceeds remaining balance of ₹${remaining.toLocaleString()}`); return }
    setPaying(true)
    try {
      const { data } = await feeService.recordPayment(feeId, {
        paid: parseFloat(payAmount),
        payment_method: payMethod,
        remark: payRemark || undefined,
        receipt_number: payReceiptNumber.trim() || undefined,
      })
      toast.success(`Payment recorded — Receipt ${data.data?.payment.receipt_number}`)
      setShowPayModal(null)
      setPayAmount('')
      setPayMethod('cash')
      setPayRemark('')
      setPayReceiptNumber('')
      if (data.data) setReceiptData(data.data)
      fetchFees()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment failed'
      toast.error(msg)
    } finally { setPaying(false) }
  }

  const openEdit = (fee: Fee) => {
    setEditingFee(fee)
    setEditAmounts({
      tuition: String(fee.tuition_amount || 0),
      transport: String(fee.transport_amount || 0),
      exam: String(fee.exam_amount || 0),
      other: String(fee.other_amount || 0),
    })
    setEditDueDate(fee.due_date.split('T')[0])
  }

  const handleEditSubmit = async () => {
    if (!editingFee) return
    const total = categoryOptions.reduce((s, c) => s + (parseFloat(editAmounts[c.value] || '0') || 0), 0)
    if (total <= 0) { toast.error('Enter an amount for at least one fee category'); return }
    if (total < editingFee.paid) { toast.error(`Total amount cannot be less than amount already paid (₹${editingFee.paid.toLocaleString()})`); return }
    if (!editDueDate) { toast.error('Select due date'); return }
    setSavingEdit(true)
    try {
      await feeService.updateFee(editingFee.id, {
        tuition_amount: parseFloat(editAmounts.tuition || '0') || 0,
        transport_amount: parseFloat(editAmounts.transport || '0') || 0,
        exam_amount: parseFloat(editAmounts.exam || '0') || 0,
        other_amount: parseFloat(editAmounts.other || '0') || 0,
        due_date: editDueDate,
      })
      toast.success('Fee updated')
      setEditingFee(null)
      fetchFees()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update fee'
      toast.error(msg)
    } finally { setSavingEdit(false) }
  }

  const openHistory = async (feeId: string) => {
    setHistoryFeeId(feeId)
    setHistoryLoading(true)
    try {
      const { data } = await feeService.getPayments(feeId)
      setHistoryPayments(data.data || [])
    } catch { toast.error('Failed to load payment history') }
    finally { setHistoryLoading(false) }
  }

  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm({ name: '', amount: '', frequency: 'monthly', category: 'tuition', description: '' })
    setShowPlanModal(true)
  }

  const openEditPlan = (p: FeePlan) => {
    setEditingPlan(p)
    setPlanForm({
      name: p.name,
      amount: String(p.amount),
      frequency: p.frequency,
      category: p.category,
      description: p.description || '',
    })
    setShowPlanModal(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPlan(true)
    try {
      if (editingPlan) {
        await feeService.updatePlan(editingPlan.id, { ...planForm, amount: parseFloat(planForm.amount) })
        toast.success('Fee plan updated')
      } else {
        await feeService.createPlan({ ...planForm, amount: parseFloat(planForm.amount) })
        toast.success('Fee plan created')
      }
      setShowPlanModal(false)
      setEditingPlan(null)
      setPlanForm({ name: '', amount: '', frequency: 'monthly', category: 'tuition', description: '' })
      feeService.getPlans().then(({ data }) => setPlans(data.data || [])).catch(() => {})
    } catch { toast.error(editingPlan ? 'Failed to update plan' : 'Failed to create plan') }
    finally { setSavingPlan(false) }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this fee plan? Fees already assigned using this plan will keep their amounts but lose the plan reference.')) return
    try {
      await feeService.deletePlan(id)
      toast.success('Fee plan deleted')
      feeService.getPlans().then(({ data }) => setPlans(data.data || [])).catch(() => {})
    } catch { toast.error('Failed to delete plan') }
  }

  const handlePrintReceipt = () => {
    const originalTitle = document.title
    document.title = receiptData ? `Receipt ${receiptData.payment.receipt_number}` : 'Receipt'
    const restoreTitle = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    window.addEventListener('afterprint', restoreTitle)
    window.print()
  }

  const totalCollected = fees.reduce((s, f) => s + f.paid, 0)
  const totalPending = fees.filter((f) => f.status !== 'paid').reduce((s, f) => s + (f.amount - f.paid), 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fees Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage fee collections</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPlansList(!showPlansList)} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${showPlansList ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <HiOutlineViewList className="h-4 w-4" /> Plans
          </button>
          <button onClick={openAssign} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
            <HiOutlinePlus className="h-4 w-4" /> Assign Fee
          </button>
        </div>
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

      {showPlansList && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Fee Plans</h2>
            <button onClick={openCreatePlan} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors">
              <HiOutlinePlus className="h-3.5 w-3.5" /> New Plan
            </button>
          </div>
          {plans.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No fee plans created yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => openEditPlan(p)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDeletePlan(p.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary-600">₹{p.amount.toLocaleString()}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${categoryColors[p.category] || categoryColors.other}`}>{p.category}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">{p.frequency.replace('_', ' ')}</span>
                    {p.due_date && <span className="text-xs text-slate-400">Due: {p.due_date}th</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search by student name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div className="relative">
              <HiOutlineFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1) }}
                className="rounded-lg border-0 bg-slate-100/80 py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none"
              >
                <option value="">All Classes</option>
                {allClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['all', 'paid', 'partial', 'pending'] as const).map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Total Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Paid</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Due</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-28 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : fees.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No fee records found</td></tr>
              ) : fees.map((f, i) => (
                <motion.tr key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">{f.student?.first_name?.[0]}{f.student?.last_name?.[0]}</div>
                      <div><p className="font-medium text-slate-800">{f.student?.first_name} {f.student?.last_name}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.class?.name}{f.class?.section ? ` - ${f.class.section}` : ''}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">₹{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-600">₹{f.paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">₹{(f.amount - f.paid).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[f.status]}`}>{f.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(f)}
                        title="Edit fee"
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openHistory(f.id)}
                        title="Payment history"
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <HiOutlineClock className="h-4 w-4" />
                      </button>
                      {f.status !== 'paid' ? (
                        <button
                          onClick={() => {
                            setShowPayModal(f.id)
                            setPayAmount(String(f.amount - f.paid))
                            setPayMethod('cash')
                            setPayRemark('')
                            setPayReceiptNumber('')
                          }}
                          className="cursor-pointer rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600"><HiOutlineCheck className="inline h-4 w-4" /> Paid</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <HiOutlineChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <HiOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowPlanModal(false); setEditingPlan(null) }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editingPlan ? 'Edit Fee Plan' : 'Create Fee Plan'}</h2>
              <button onClick={() => { setShowPlanModal(false); setEditingPlan(null) }} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSavePlan} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Plan Name</label><input required value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Class Fee" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Amount</label><input required type="number" value={planForm.amount} onChange={(e) => setPlanForm({ ...planForm, amount: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Frequency</label><select value={planForm.frequency} onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One Time</option>
              </select></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Category</label><select value={planForm.category} onChange={(e) => setPlanForm({ ...planForm, category: e.target.value as PlanCategory })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                {planCategoryOptions.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowPlanModal(false); setEditingPlan(null) }} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={savingPlan} className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{savingPlan ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ${assignStep === 'confirm' ? 'flex max-h-[90vh] flex-col' : 'p-6'}`}>
            <div className={`flex items-center justify-between ${assignStep === 'confirm' ? 'px-6 pt-6 pb-4' : 'mb-6'}`}>
              <div className="flex items-center gap-3">
                {assignStep !== 'class' && (
                  <button onClick={() => setAssignStep(assignStep === 'confirm' ? 'students' : 'class')} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                    <HiOutlineChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-lg font-bold text-slate-800">
                  {assignStep === 'class' ? 'Select Class' : assignStep === 'students' ? 'Select Students' : 'Confirm & Assign'}
                </h2>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>

            {assignStep === 'class' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Choose a class to see its students, then select who to assign fees to.</p>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
                  <select
                    value={assignClassId}
                    onChange={(e) => setAssignClassId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select a class...</option>
                    {allClasses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    disabled={!assignClassId}
                    onClick={() => {
                      const cls = allClasses.find((c) => c.id === assignClassId)
                      setClassFeeAmount(cls?.fee_amount ?? null)
                      loadClassStudents(assignClassId)
                      setAssignStep('students')
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
                  >
                    Next <HiOutlineUsers className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {assignStep === 'students' && (
              <div className="space-y-4">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" placeholder="Search by name, roll number, email, or phone..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {studentLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="mt-1 h-3 w-24 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">No students found in this class</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0} onChange={toggleAllStudents} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-xs font-medium text-slate-600">Select All ({filteredStudents.length})</span>
                      </label>
                      <span className="text-xs text-slate-400 ml-auto">{selectedStudents.length} selected</span>
                    </div>
                    <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                      {filteredStudents.map((s) => (
                        <label key={s.id} className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 ${selectedStudents.includes(s.id) ? 'bg-primary-50/50' : ''}`}>
                          <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">{s.first_name?.[0]}{s.last_name?.[0]}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{s.first_name} {s.last_name}</p>
                            <p className="text-xs text-slate-400">{s.roll_number ? `#${s.roll_number}` : ''}{s.email ? ` | ${s.email}` : ''}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setAssignStep('class')} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Back</button>
                  <button
                    disabled={selectedStudents.length === 0}
                    onClick={() => {
                      if (!assignAmounts.tuition && classFeeAmount) {
                        setAssignAmounts((prev) => ({ ...prev, tuition: String(classFeeAmount) }))
                      }
                      setAssignStep('confirm')
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
                  >
                    Next ({selectedStudents.length} selected)
                  </button>
                </div>
              </div>
            )}

            {assignStep === 'confirm' && (
              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Selected Students</p>
                  <p className="mt-1 text-xs text-slate-500">{selectedStudents.length} student(s) from {allClasses.find((c) => c.id === assignClassId)?.name}</p>
                  <div className="mt-2 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">
                    {classStudents.filter((s) => selectedStudents.includes(s.id)).map((s) => (
                      <span key={s.id} className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">{s.first_name} {s.last_name}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Fee Amount by Category</label>
                  <p className="mb-2 text-xs text-slate-400">Fill in the categories that apply for these students (per student). At least one is required. If a student already has a fee in a category, it will be updated to this amount and due date instead of duplicated.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {categoryOptions.map((c) => (
                      <div key={c.value}>
                        <label className="mb-1 block text-xs font-medium text-slate-600">{c.label} (₹)</label>
                        <input
                          type="number"
                          value={assignAmounts[c.value]}
                          onChange={(e) => setAssignAmounts({ ...assignAmounts, [c.value]: e.target.value })}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                        {c.value === 'tuition' && classFeeAmount != null && (
                          <p className="mt-1 text-xs text-slate-400">Class fixed fee: ₹{classFeeAmount.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div><label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                  <input required type="date" value={assignDueDate} onChange={(e) => setAssignDueDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>

                {(() => {
                  const active = categoryOptions.filter((c) => parseFloat(assignAmounts[c.value] || '0') > 0)
                  const perStudentTotal = active.reduce((s, c) => s + parseFloat(assignAmounts[c.value] || '0'), 0)
                  return (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-sm text-slate-600">
                        Total amount to collect: <span className="font-semibold text-slate-800">₹{(perStudentTotal * selectedStudents.length).toLocaleString()}</span>
                        <span className="text-xs text-slate-400"> ({selectedStudents.length} students × ₹{perStudentTotal.toLocaleString()} across {active.length || 0} categor{active.length === 1 ? 'y' : 'ies'})</span>
                      </p>
                    </div>
                  )
                })()}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setAssignStep('students')} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Back</button>
                  <button
                    onClick={handleAssignSubmit}
                    disabled={assigning || categoryOptions.every((c) => !(parseFloat(assignAmounts[c.value] || '0') > 0))}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                  >
                    {assigning ? 'Assigning...' : `Assign to ${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingFee(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Fee</h2>
              <button onClick={() => setEditingFee(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <p className="text-sm text-slate-500">{editingFee.student?.first_name} {editingFee.student?.last_name}</p>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fee Amount by Category</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {categoryOptions.map((c) => (
                    <div key={c.value}>
                      <label className="mb-1 block text-xs font-medium text-slate-600">{c.label} (₹)</label>
                      <input
                        type="number"
                        value={editAmounts[c.value]}
                        onChange={(e) => setEditAmounts({ ...editAmounts, [c.value]: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">Already paid: ₹{editingFee.paid.toLocaleString()}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <p className="text-sm text-slate-600">
                  Total: <span className="font-semibold text-slate-800">₹{categoryOptions.reduce((s, c) => s + (parseFloat(editAmounts[c.value] || '0') || 0), 0).toLocaleString()}</span>
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditingFee(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button disabled={savingEdit} onClick={handleEditSubmit} className="cursor-pointer rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPayModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setShowPayModal(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                {(() => {
                  const fee = fees.find((f) => f.id === showPayModal)
                  return fee ? <p className="mt-1 text-xs text-slate-400">Remaining balance: ₹{(fee.amount - fee.paid).toLocaleString()}</p> : null
                })()}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Payment Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Receipt Number (optional)</label>
                <input type="text" value={payReceiptNumber} onChange={(e) => setPayReceiptNumber(e.target.value)} placeholder="Leave blank to auto-generate" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Remark (optional)</label>
                <textarea value={payRemark} onChange={(e) => setPayRemark(e.target.value)} rows={2} placeholder="e.g. Cheque #12345" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPayModal(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button disabled={paying} onClick={() => handlePay(showPayModal)} className="cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{paying ? 'Recording...' : 'Pay Now'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {historyFeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setHistoryFeeId(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
              <button onClick={() => setHistoryFeeId(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
            {historyLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-14 w-full rounded-lg" />))}
              </div>
            ) : historyPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No payments recorded yet</p>
            ) : (
              <div className="space-y-2">
                {historyPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        ₹{p.amount.toLocaleString()}
                        <span className="ml-1.5 text-xs font-normal capitalize text-slate-400">({p.payment_method.replace('_', ' ')})</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{p.receipt_number} · {new Date(p.payment_date).toLocaleString()}</p>
                      {p.remark && <p className="mt-0.5 text-xs text-slate-400">{p.remark}</p>}
                    </div>
                    <button
                      onClick={() => {
                        const fee = fees.find((f) => f.id === historyFeeId)
                        if (fee) setReceiptData({ fee, payment: p })
                      }}
                      className="cursor-pointer rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      Reprint
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </motion.div>
        </div>
      )}

      {receiptData && (
        <>
          <style>{`
            @media print {
              @page { margin: 12mm; }
              body * { visibility: hidden; }
              #receipt-print-area, #receipt-print-area * { visibility: visible; }
              #receipt-print-area {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: auto !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                max-height: none !important;
                height: auto !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                transform: none !important;
              }
              #receipt-print-area * { transform: none !important; }
            }
          `}</style>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm print:hidden" onClick={() => setReceiptData(null)} />
            <motion.div id="receipt-print-area" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl print:max-h-full print:transform-none">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 print:hidden">
                <h2 className="text-lg font-bold text-slate-800">Payment Receipt</h2>
                <button onClick={() => setReceiptData(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-6 text-sm print:overflow-visible">
                <div className="pb-2 text-center">
                  <p className="text-base font-bold text-slate-800">{schoolName}</p>
                  {admin?.school?.address && <p className="text-xs text-slate-400">{admin.school.address}</p>}
                </div>
                <div className="border-b border-dashed border-slate-200 pb-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Receipt No.</p>
                  <p className="text-lg font-bold text-primary-600">{receiptData.payment.receipt_number}</p>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Student</span><span className="font-medium text-slate-800">{receiptData.fee.student?.first_name} {receiptData.fee.student?.last_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Class</span><span className="font-medium text-slate-800">{receiptData.fee.class?.name}{receiptData.fee.class?.section ? ` - ${receiptData.fee.class.section}` : ''}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Fee</span><span className="font-medium text-slate-800">₹{receiptData.fee.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Amount Paid</span><span className="font-bold text-emerald-600">₹{receiptData.payment.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment Method</span><span className="font-medium capitalize text-slate-800">{receiptData.payment.payment_method.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium text-slate-800">{new Date(receiptData.payment.payment_date).toLocaleString()}</span></div>
                {receiptData.payment.remark && <div className="flex justify-between"><span className="text-slate-500">Remark</span><span className="font-medium text-slate-800">{receiptData.payment.remark}</span></div>}
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3"><span className="text-slate-500">Remaining Balance</span><span className="font-semibold text-red-600">₹{(receiptData.fee.amount - receiptData.fee.paid).toLocaleString()}</span></div>
              </div>
              <div className="flex justify-end gap-3 px-6 pt-6 pb-6 print:hidden">
                <button onClick={() => setReceiptData(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
                <button onClick={handlePrintReceipt} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">
                  <HiOutlinePrinter className="h-4 w-4" /> Print
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
