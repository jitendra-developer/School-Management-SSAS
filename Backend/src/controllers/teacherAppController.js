import { prisma } from '../config/db.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import { attendanceService } from '../services/attendanceService.js'

export const getMyClass = asyncHandler(async (req, res) => {
  const teacher = req.teacher

  if (!teacher.class_id) {
    return successResponse(res, {
      message: 'You are not assigned as a class teacher',
      data: { teacher, class: null, students: [], attendance: null },
    })
  }

  const dateStr = new Date().toISOString().split('T')[0]

  const [students, attendance] = await Promise.all([
    prisma.student.findMany({
      where: { class_id: teacher.class_id, school_id: teacher.school_id },
      orderBy: { roll_number: 'asc' },
    }),
    attendanceService.getByDate(dateStr, teacher.school_id, { type: 'student' }),
  ])

  const attendanceMap = {}
  if (attendance?.student_attendance) {
    for (const rec of attendance.student_attendance) {
      attendanceMap[rec.student_id] = rec.status
    }
  }

  return successResponse(res, {
    message: 'Class data fetched',
    data: {
      teacher,
      class: teacher.class,
      students,
      attendance: attendanceMap,
      date: dateStr,
    },
  })
})
