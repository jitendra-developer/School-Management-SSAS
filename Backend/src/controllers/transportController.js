import { transportService } from '../services/transportService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getRoutes = asyncHandler(async (req, res) => {
  const data = await transportService.getRoutes(req.admin.school_id)
  return successResponse(res, { message: 'Routes fetched', data })
})

export const createRoute = asyncHandler(async (req, res) => {
  const data = await transportService.createRoute(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Route created', data, statusCode: 201 })
})

export const updateRoute = asyncHandler(async (req, res) => {
  const data = await transportService.updateRoute(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Route updated', data })
})

export const deleteRoute = asyncHandler(async (req, res) => {
  await transportService.deleteRoute(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Route deleted' })
})

export const getAssignments = asyncHandler(async (req, res) => {
  const data = await transportService.getAssignments(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Assignments fetched', data })
})

export const assignStudent = asyncHandler(async (req, res) => {
  const data = await transportService.assignStudent(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Student assigned', data, statusCode: 201 })
})

export const removeAssignment = asyncHandler(async (req, res) => {
  await transportService.removeAssignment(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Assignment removed' })
})

export const updateAssignment = asyncHandler(async (req, res) => {
  const data = await transportService.updateAssignment(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Assignment updated', data })
})
