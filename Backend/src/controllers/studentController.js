import { studentService } from '../services/studentService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createStudent = asyncHandler(async (req, res) => {
  const data = await studentService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Student created', data, statusCode: 201 })
})

export const getAllStudents = asyncHandler(async (req, res) => {
  const data = await studentService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Students fetched', data })
})

export const getStudentById = asyncHandler(async (req, res) => {
  const data = await studentService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Student fetched', data })
})

export const updateStudent = asyncHandler(async (req, res) => {
  const data = await studentService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Student updated', data })
})

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Student deleted' })
})
