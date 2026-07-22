import { messageService } from '../services/messageService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getMessages = asyncHandler(async (req, res) => {
  const data = await messageService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Messages fetched', data })
})

export const getMessageById = asyncHandler(async (req, res) => {
  const data = await messageService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Message fetched', data })
})

export const sendMessage = asyncHandler(async (req, res) => {
  const data = await messageService.send(req.body, req.admin.school_id, req.admin.id)
  return successResponse(res, { message: 'Message sent', data, statusCode: 201 })
})

export const markRead = asyncHandler(async (req, res) => {
  const data = await messageService.markRead(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Message marked as read', data })
})

export const deleteMessage = asyncHandler(async (req, res) => {
  await messageService.deleteMessage(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Message deleted' })
})
