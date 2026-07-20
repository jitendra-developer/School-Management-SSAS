import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const noticeBase = {
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  category: optionalString,
  posted_by: optionalString,
  attachment: optionalString,
  publish_date: optionalString,
  expiry_date: optionalString,
}

export const createNoticeSchema = z.object(noticeBase)
export const updateNoticeSchema = z.object(noticeBase).partial()
