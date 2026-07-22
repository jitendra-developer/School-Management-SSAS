import { libraryService } from '../services/libraryService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getBooks = asyncHandler(async (req, res) => {
  const data = await libraryService.getBooks(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Books fetched', data })
})

export const createBook = asyncHandler(async (req, res) => {
  const data = await libraryService.createBook(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Book created', data, statusCode: 201 })
})

export const updateBook = asyncHandler(async (req, res) => {
  const data = await libraryService.updateBook(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Book updated', data })
})

export const deleteBook = asyncHandler(async (req, res) => {
  await libraryService.deleteBook(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Book deleted' })
})

export const getIssues = asyncHandler(async (req, res) => {
  const data = await libraryService.getIssues(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Issues fetched', data })
})

export const issueBook = asyncHandler(async (req, res) => {
  const data = await libraryService.issueBook(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Book issued', data, statusCode: 201 })
})

export const returnBook = asyncHandler(async (req, res) => {
  const data = await libraryService.returnBook(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Book returned', data })
})

export const updateIssue = asyncHandler(async (req, res) => {
  const data = await libraryService.updateIssue(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Issue updated', data })
})

export const deleteIssue = asyncHandler(async (req, res) => {
  await libraryService.deleteIssue(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Issue deleted' })
})
