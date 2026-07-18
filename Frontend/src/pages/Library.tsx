import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineReply, HiOutlineEye } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { libraryService } from '@/services/libraryService'
import type { Book, BookIssue } from '@/types/library'

type TabType = 'books' | 'issues'

const issueStatusColors: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  returned: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function Library() {
  const [tab, setTab] = useState<TabType>('books')
  const [books, setBooks] = useState<Book[]>([])
  const [issues, setIssues] = useState<BookIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', publisher: '', quantity: '1', available: '1' })
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueForm, setIssueForm] = useState({ book_id: '', student_id: '', due_date: '' })
  const [viewingBook, setViewingBook] = useState<Book | null>(null)
  const [viewingIssue, setViewingIssue] = useState<BookIssue | null>(null)
  const [editingIssue, setEditingIssue] = useState<BookIssue | null>(null)
  const [editIssueDueDate, setEditIssueDueDate] = useState('')
  const [editIssueSubmitting, setEditIssueSubmitting] = useState(false)

  const fetchIdRef = useRef(0)

  useEffect(() => { tab === 'books' ? fetchBooks() : fetchIssues() }, [tab])

  const fetchBooks = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await libraryService.getBooks({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setBooks(data.data?.books || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load books')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const fetchIssues = async () => {
    const requestId = ++fetchIdRef.current
    setLoading(true)
    try {
      const { data } = await libraryService.getIssues({ limit: '50' })
      if (requestId !== fetchIdRef.current) return
      setIssues(data.data?.issues || [])
    } catch {
      if (requestId === fetchIdRef.current) toast.error('Failed to load issues')
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false)
    }
  }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...bookForm, quantity: parseInt(bookForm.quantity), available: parseInt(bookForm.available) }
      if (editing) { await libraryService.updateBook(editing.id, payload); toast.success('Book updated') }
      else { await libraryService.createBook(payload); toast.success('Book created') }
      setShowModal(false); setEditing(null)
      setBookForm({ title: '', author: '', isbn: '', publisher: '', quantity: '1', available: '1' })
      fetchBooks()
    } catch { toast.error('Operation failed') }
  }

  const handleBookEdit = (b: Book) => {
    setEditing(b)
    setBookForm({ title: b.title, author: b.author, isbn: b.isbn || '', publisher: b.publisher || '', quantity: String(b.quantity), available: String(b.available) })
    setShowModal(true)
  }

  const handleBookDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return
    try { await libraryService.deleteBook(id); toast.success('Book deleted'); fetchBooks() }
    catch { toast.error('Delete failed') }
  }

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await libraryService.issueBook(issueForm)
      toast.success('Book issued')
      setShowIssueModal(false)
      setIssueForm({ book_id: '', student_id: '', due_date: '' })
      fetchIssues()
    } catch { toast.error('Issue failed') }
  }

  const handleReturn = async (id: string) => {
    if (!confirm('Mark this book as returned?')) return
    try { await libraryService.returnBook(id); toast.success('Book returned'); fetchIssues() }
    catch { toast.error('Return failed') }
  }

  const handleIssueDelete = async (id: string) => {
    if (!confirm('Delete this issue record?')) return
    try { await libraryService.deleteIssue(id); toast.success('Issue deleted'); fetchIssues() }
    catch { toast.error('Delete failed') }
  }

  const openEditIssue = (i: BookIssue) => {
    setEditingIssue(i)
    setEditIssueDueDate(i.due_date.split('T')[0])
  }

  const handleEditIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIssue) return
    setEditIssueSubmitting(true)
    try {
      await libraryService.updateIssue(editingIssue.id, { due_date: editIssueDueDate })
      toast.success('Issue updated')
      setEditingIssue(null)
      fetchIssues()
    } catch { toast.error('Update failed') }
    finally { setEditIssueSubmitting(false) }
  }

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  const filteredIssues = issues.filter((i) =>
    i.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.student?.first_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Library</h1>
          <p className="mt-1 text-sm text-slate-500">Manage books and library records</p>
        </div>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab('books')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'books' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineBookOpen className="mr-1.5 inline-block h-4 w-4" /> Books
            </button>
            <button onClick={() => setTab('issues')} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === 'issues' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              <HiOutlineClipboardList className="mr-1.5 inline-block h-4 w-4" /> Issues
            </button>
          </div>
          {tab === 'books' ? (
            <button onClick={() => { setEditing(null); setBookForm({ title: '', author: '', isbn: '', publisher: '', quantity: '1', available: '1' }); setShowModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Add Book
            </button>
          ) : (
            <button onClick={() => { setIssueForm({ book_id: '', student_id: '', due_date: '' }); setShowIssueModal(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
              <HiOutlinePlus className="h-4 w-4" /> Issue Book
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={tab === 'books' ? 'Search books...' : 'Search issues...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'books' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">ISBN</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Available</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-36 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-10 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredBooks.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No books found</td></tr>
                ) : filteredBooks.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{b.title}</td>
                    <td className="px-4 py-3 text-slate-600">{b.author}</td>
                    <td className="px-4 py-3 text-slate-600">{b.isbn || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{b.quantity}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{b.available}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingBook(b)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => handleBookEdit(b)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleBookDelete(b.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Book</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Issue Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredIssues.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No issues found</td></tr>
                ) : filteredIssues.map((i, idx) => (
                  <motion.tr key={i.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{i.book?.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{i.student?.first_name} {i.student?.last_name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(i.issue_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(i.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${issueStatusColors[i.status] || 'bg-slate-100 text-slate-600'}`}>{i.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewingIssue(i)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => openEditIssue(i)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => handleIssueDelete(i.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><HiOutlineTrash className="h-4 w-4" /></button>
                      {i.status !== 'returned' && (
                        <button onClick={() => handleReturn(i.id)} className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <HiOutlineReply className="h-3.5 w-3.5" /> Return
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Book' : 'Add Book'}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleBookSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Author</label><input required value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">ISBN</label><input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Publisher</label><input value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label><input required type="number" min="1" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Available</label><input required type="number" min="0" value={bookForm.available} onChange={(e) => setBookForm({ ...bookForm, available: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowIssueModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Issue Book</h2>
              <button onClick={() => setShowIssueModal(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleIssue} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Book ID</label><input required value={issueForm.book_id} onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })} placeholder="Enter book ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
                <div><label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label><input required value={issueForm.student_id} onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })} placeholder="Enter student ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label><input required type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueModal(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg">Issue</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingBook(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Book Details</h2>
              <button onClick={() => setViewingBook(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Title</p><p className="font-medium text-slate-700">{viewingBook.title}</p></div>
                <div><p className="text-slate-400">Author</p><p className="font-medium text-slate-700">{viewingBook.author}</p></div>
                <div><p className="text-slate-400">ISBN</p><p className="font-medium text-slate-700">{viewingBook.isbn || '—'}</p></div>
                <div><p className="text-slate-400">Publisher</p><p className="font-medium text-slate-700">{viewingBook.publisher || '—'}</p></div>
                <div><p className="text-slate-400">Total Quantity</p><p className="font-medium text-slate-700">{viewingBook.quantity}</p></div>
                <div><p className="text-slate-400">Available</p><p className="font-medium text-slate-700">{viewingBook.available}</p></div>
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingBook(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {viewingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingIssue(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Issue Details</h2>
              <button onClick={() => setViewingIssue(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Book</p><p className="font-medium text-slate-700">{viewingIssue.book?.title || '—'}</p></div>
                <div><p className="text-slate-400">Student</p><p className="font-medium text-slate-700">{viewingIssue.student?.first_name} {viewingIssue.student?.last_name}</p></div>
                <div><p className="text-slate-400">Issue Date</p><p className="font-medium text-slate-700">{new Date(viewingIssue.issue_date).toLocaleDateString()}</p></div>
                <div><p className="text-slate-400">Due Date</p><p className="font-medium text-slate-700">{new Date(viewingIssue.due_date).toLocaleDateString()}</p></div>
                <div><p className="text-slate-400">Status</p><p className="font-medium capitalize text-slate-700">{viewingIssue.status}</p></div>
                {viewingIssue.return_date && <div><p className="text-slate-400">Return Date</p><p className="font-medium text-slate-700">{new Date(viewingIssue.return_date).toLocaleDateString()}</p></div>}
              </div>
            </div>
            <div className="flex justify-end px-6 pt-2 pb-6">
              <button onClick={() => setViewingIssue(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingIssue(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Issue</h2>
              <button onClick={() => setEditingIssue(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditIssueSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <p className="text-sm text-slate-500">{editingIssue.book?.title} — {editingIssue.student?.first_name} {editingIssue.student?.last_name}</p>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label><input required type="date" value={editIssueDueDate} onChange={(e) => setEditIssueDueDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingIssue(null)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={editIssueSubmitting} className="cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60">{editIssueSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
