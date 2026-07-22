import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiOutlineMailOpen, HiOutlinePaperAirplane, HiOutlineX, HiOutlineReply, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi'
import Skeleton from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { messageService } from '@/services/messageService'
import type { Message } from '@/types/message'

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [viewing, setViewing] = useState<Message | null>(null)
  const [composeForm, setComposeForm] = useState({ receiver_id: '', subject: '', body: '' })

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    try {
      const { data } = await messageService.getAll({ limit: '50' })
      setMessages(data.data?.messages || [])
    } catch { toast.error('Failed to load messages') }
    finally { setLoading(false) }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await messageService.send(composeForm)
      toast.success('Message sent')
      setShowCompose(false)
      setComposeForm({ receiver_id: '', subject: '', body: '' })
      fetchMessages()
    } catch { toast.error('Failed to send message') }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await messageService.markRead(id)
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
    } catch { /* ignore */ }
  }

  const openMessage = (msg: Message) => {
    setViewing(msg)
    if (!msg.read) handleMarkRead(msg.id)
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      await messageService.delete(id)
      toast.success('Message deleted')
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (viewing?.id === id) setViewing(null)
    } catch { toast.error('Delete failed') }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  const filtered = messages.filter((m) =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    (m.sender?.name && m.sender.name.toLowerCase().includes(search.toLowerCase())) ||
    m.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}</p>
        </div>
        <button onClick={() => { setComposeForm({ receiver_id: '', subject: '', body: '' }); setShowCompose(true) }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:shadow-xl hover:scale-[1.02]">
          <HiOutlinePaperAirplane className="h-4 w-4" /> Compose
        </button>
      </motion.div>

      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border-0 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-3.5">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <Skeleton className="mt-1 h-4 w-48 rounded" />
                    <Skeleton className="mt-1 h-3 w-64 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400">No messages found</div>
          ) : filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => openMessage(m)} className="flex items-start gap-4 px-4 py-3.5 hover:bg-slate-50/50 cursor-pointer transition-colors">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${m.read ? 'bg-slate-300' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                {m.sender?.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${m.read ? 'text-slate-600' : 'text-slate-800'}`}>{m.sender?.name || 'Unknown'}</span>
                    {!m.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{new Date(m.sent_at).toLocaleDateString()}</span>
                </div>
                <p className={`mt-0.5 text-sm truncate ${m.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{m.subject}</p>
                <p className="mt-0.5 text-xs text-slate-400 truncate">{m.body}</p>
              </div>
              <div className="shrink-0 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {!m.read && (
                  <button onClick={() => handleMarkRead(m.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600" title="Mark as read">
                    <HiOutlineMailOpen className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => openMessage(m)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="View"><HiOutlineEye className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteMessage(m.id)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete"><HiOutlineTrash className="h-4 w-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Compose Message</h2>
              <button onClick={() => setShowCompose(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSend} className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Recipient ID</label><input required value={composeForm.receiver_id} onChange={(e) => setComposeForm({ ...composeForm, receiver_id: e.target.value })} placeholder="Enter user ID" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Subject</label><input required value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Message</label><textarea required value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCompose(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl">
                  <HiOutlinePaperAirplane className="h-4 w-4" /> Send
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{viewing.subject}</h2>
              <button onClick={() => setViewing(null)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><HiOutlineX className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">{viewing.sender?.name?.[0] || '?'}</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{viewing.sender?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{viewing.sender?.email || ''} &middot; {new Date(viewing.sent_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewing.body}</div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => handleDeleteMessage(viewing.id)} className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <HiOutlineTrash className="h-4 w-4" /> Delete
                </button>
                <button onClick={() => { setViewing(null); setComposeForm({ receiver_id: viewing.sender_id, subject: `Re: ${viewing.subject}`, body: '' }); setShowCompose(true) }} className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <HiOutlineReply className="h-4 w-4" /> Reply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
