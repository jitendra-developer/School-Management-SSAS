import { hostelService } from '../services/hostelService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getHostels = asyncHandler(async (req, res) => {
  const data = await hostelService.getHostels(req.admin.school_id)
  return successResponse(res, { message: 'Hostels fetched', data })
})

export const createHostel = asyncHandler(async (req, res) => {
  const data = await hostelService.createHostel(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Hostel created', data, statusCode: 201 })
})

export const updateHostel = asyncHandler(async (req, res) => {
  const data = await hostelService.updateHostel(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Hostel updated', data })
})

export const deleteHostel = asyncHandler(async (req, res) => {
  await hostelService.deleteHostel(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Hostel deleted' })
})

export const getRooms = asyncHandler(async (req, res) => {
  const data = await hostelService.getRooms(req.params.hostelId, req.admin.school_id)
  return successResponse(res, { message: 'Rooms fetched', data })
})

export const createRoom = asyncHandler(async (req, res) => {
  const data = await hostelService.createRoom(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Room created', data, statusCode: 201 })
})

export const updateRoom = asyncHandler(async (req, res) => {
  const data = await hostelService.updateRoom(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Room updated', data })
})

export const deleteRoom = asyncHandler(async (req, res) => {
  await hostelService.deleteRoom(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Room deleted' })
})

export const getAssignments = asyncHandler(async (req, res) => {
  const data = await hostelService.getAssignments(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Room assignments fetched', data })
})

export const assignStudent = asyncHandler(async (req, res) => {
  const data = await hostelService.assignStudent(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Student assigned to room', data, statusCode: 201 })
})

export const removeAssignment = asyncHandler(async (req, res) => {
  await hostelService.removeAssignment(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Room assignment removed' })
})
