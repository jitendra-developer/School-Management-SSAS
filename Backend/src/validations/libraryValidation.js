import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const bookBase = {
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  isbn: optionalString,
  publisher: optionalString,
  quantity: z.coerce.number().optional(),
  available: z.coerce.number().optional(),
}

export const createBookSchema = z.object(bookBase)
export const updateBookSchema = z.object(bookBase).partial()

export const issueBookSchema = z.object({
  book_id: z.string().trim().min(1, 'Book is required'),
  student_id: z.string().trim().min(1, 'Student is required'),
  due_date: optionalString,
})

export const updateIssueSchema = z.object({
  due_date: z.string().trim().min(1, 'Due date is required'),
})
