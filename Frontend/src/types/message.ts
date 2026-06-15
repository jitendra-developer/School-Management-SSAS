export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  body: string
  read: boolean
  sent_at: string
  sender?: { id: string; name: string; email: string }
}
