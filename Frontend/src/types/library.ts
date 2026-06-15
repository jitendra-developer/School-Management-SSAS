export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  publisher?: string
  quantity: number
  available: number
}

export interface BookIssue {
  id: string
  book_id: string
  student_id: string
  issue_date: string
  due_date: string
  return_date?: string
  status: string
  book?: Book
  student?: { id: string; first_name: string; last_name: string }
}
