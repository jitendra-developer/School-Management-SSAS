import { subjectService } from '../services/subjectService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getAllSubjects = asyncHandler(async (req, res) => {
  const data = await subjectService.getAll(req.admin.school_id)
  return successResponse(res, { message: 'Subjects fetched', data })
})

export const getSubjectsByClass = asyncHandler(async (req, res) => {
  const data = await subjectService.getByClass(req.params.classId, req.admin.school_id)
  return successResponse(res, { message: 'Subjects fetched', data })
})

export const addSubjects = asyncHandler(async (req, res) => {
  const { names } = req.body
  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ success: false, message: 'Provide at least one subject name' })
  }
  const data = await subjectService.bulkCreate(req.params.classId, names, req.admin.school_id)
  return successResponse(res, { message: 'Subjects added', data, statusCode: 201 })
})

export const deleteSubject = asyncHandler(async (req, res) => {
  await subjectService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Subject deleted' })
})
