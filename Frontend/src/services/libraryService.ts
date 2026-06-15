import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Book, BookIssue } from '@/types/library'

export const libraryService = {
  getBooks: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ books: Book[]; total: number }>>('/library/books', { params }),
  createBook: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Book>>('/library/books', data),
  updateBook: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Book>>(`/library/books/${id}`, data),
  deleteBook: (id: string) =>
    api.delete<ApiResponse<null>>(`/library/books/${id}`),
  getIssues: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ issues: BookIssue[]; total: number }>>('/library/issues', { params }),
  issueBook: (data: Record<string, unknown>) =>
    api.post<ApiResponse<BookIssue>>('/library/issue', data),
  returnBook: (id: string) =>
    api.post<ApiResponse<BookIssue>>(`/library/return/${id}`),
}
