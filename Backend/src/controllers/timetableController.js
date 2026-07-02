import { timetableService } from '../services/timetableService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createEntry = asyncHandler(async (req, res) => {
  const data = await timetableService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Timetable entry created', data, statusCode: 201 })
})

export const getAllEntries = asyncHandler(async (req, res) => {
  const data = await timetableService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Timetable entries fetched', data })
})

export const getEntryById = asyncHandler(async (req, res) => {
  const data = await timetableService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Timetable entry fetched', data })
})

export const updateEntry = asyncHandler(async (req, res) => {
  const data = await timetableService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Timetable entry updated', data })
})

export const deleteEntry = asyncHandler(async (req, res) => {
  await timetableService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Timetable entry deleted' })
})
