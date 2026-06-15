import { noticeService } from '../services/noticeService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createNotice = asyncHandler(async (req, res) => {
  const data = await noticeService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Notice created', data, statusCode: 201 })
})

export const getAllNotices = asyncHandler(async (req, res) => {
  const data = await noticeService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Notices fetched', data })
})

export const getNoticeById = asyncHandler(async (req, res) => {
  const data = await noticeService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Notice fetched', data })
})

export const updateNotice = asyncHandler(async (req, res) => {
  const data = await noticeService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Notice updated', data })
})

export const deleteNotice = asyncHandler(async (req, res) => {
  await noticeService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Notice deleted' })
})
