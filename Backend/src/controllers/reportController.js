import { reportService } from '../services/reportService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await reportService.dashboardStats(req.admin.school_id)
  return successResponse(res, { message: 'Dashboard stats fetched', data })
})

export const getFeeReport = asyncHandler(async (req, res) => {
  const data = await reportService.feeReport(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Fee report fetched', data })
})

export const getAttendanceReport = asyncHandler(async (req, res) => {
  const data = await reportService.attendanceReport(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Attendance report fetched', data })
})

export const getStudentReport = asyncHandler(async (req, res) => {
  const data = await reportService.studentReport(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Student report fetched', data })
})
