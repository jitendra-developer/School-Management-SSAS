import { teacherService } from '../services/teacherService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createTeacher = asyncHandler(async (req, res) => {
  const data = await teacherService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Teacher created', data, statusCode: 201 })
})

export const getAllTeachers = asyncHandler(async (req, res) => {
  const data = await teacherService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Teachers fetched', data })
})

export const getTeacherById = asyncHandler(async (req, res) => {
  const data = await teacherService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Teacher fetched', data })
})

export const updateTeacher = asyncHandler(async (req, res) => {
  const data = await teacherService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Teacher updated', data })
})

export const deleteTeacher = asyncHandler(async (req, res) => {
  await teacherService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Teacher deleted' })
})
