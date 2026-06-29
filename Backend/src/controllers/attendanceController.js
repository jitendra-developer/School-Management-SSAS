import { attendanceService } from '../services/attendanceService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

const schoolId = (req) => req.admin?.school_id || req.teacher?.school_id

export const markAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.mark(req.body, schoolId(req))
  return successResponse(res, { message: 'Attendance recorded', data })
})

export const getAttendanceByDate = asyncHandler(async (req, res) => {
  const data = await attendanceService.getByDate(req.params.date, schoolId(req), req.query)
  return successResponse(res, { message: 'Attendance fetched', data })
})

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getStudentRecords(req.params.studentId, schoolId(req), req.query)
  return successResponse(res, { message: 'Attendance records fetched', data })
})

export const getTeacherAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getTeacherRecords(req.params.teacherId, schoolId(req), req.query)
  return successResponse(res, { message: 'Attendance records fetched', data })
})
