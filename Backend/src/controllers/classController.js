import { classService } from '../services/classService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createClass = asyncHandler(async (req, res) => {
  const data = await classService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Class created', data, statusCode: 201 })
})

export const getAllClasses = asyncHandler(async (req, res) => {
  const data = await classService.getAll(req.admin.school_id)
  return successResponse(res, { message: 'Classes fetched', data })
})

export const getClassById = asyncHandler(async (req, res) => {
  const data = await classService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Class fetched', data })
})

export const updateClass = asyncHandler(async (req, res) => {
  const data = await classService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Class updated', data })
})

export const deleteClass = asyncHandler(async (req, res) => {
  await classService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Class deleted' })
})

export const getClassStudents = asyncHandler(async (req, res) => {
  const data = await classService.getStudents(req.params.id, req.admin.school_id, req.query)
  return successResponse(res, { message: 'Class students fetched', data })
})

export const bulkUploadStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }
  const data = await classService.bulkUploadStudents(req.params.id, req.admin.school_id, req.file)
  return successResponse(res, { message: `Successfully imported ${data.imported} student(s)`, data })
})
