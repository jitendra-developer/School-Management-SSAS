import { prisma } from '../config/db.js'

export const attendanceService = {
  async mark({ date, type, records }, school_id) {
    const attDate = new Date(date)
    attDate.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.upsert({
      where: { school_id_date_type: { school_id, date: attDate, type } },
      create: { school_id, date: attDate, type },
      update: {},
    })

    if (type === 'student') {
      for (const r of records) {
        await prisma.studentAttendance.upsert({
          where: { attendance_id_student_id: { attendance_id: attendance.id, student_id: r.student_id } },
          create: { attendance_id: attendance.id, student_id: r.student_id, status: r.status, remark: r.remark },
          update: { status: r.status, remark: r.remark },
        })
      }
    } else {
      for (const r of records) {
        await prisma.teacherAttendance.upsert({
          where: { attendance_id_teacher_id: { attendance_id: attendance.id, teacher_id: r.teacher_id } },
          create: { attendance_id: attendance.id, teacher_id: r.teacher_id, status: r.status, remark: r.remark },
          update: { status: r.status, remark: r.remark },
        })
      }
    }

    return attendance
  },

  async getByDate(date, school_id, query = {}) {
    const { type = 'student' } = query
    const attDate = new Date(date)
    attDate.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findUnique({
      where: { school_id_date_type: { school_id, date: attDate, type } },
      include: {
        student_attendance: {
          include: { student: { select: { id: true, first_name: true, last_name: true, class_id: true } } },
        },
        teacher_attendance: {
          include: { teacher: { select: { id: true, first_name: true, last_name: true } } },
        },
      },
    })

    return attendance || { date: attDate, type, records: [] }
  },

  async getStudentRecords(studentId, school_id, query = {}) {
    const { limit = 30 } = query
    const records = await prisma.studentAttendance.findMany({
      where: {
        student_id: studentId,
        attendance: { school_id },
      },
      include: { attendance: true },
      orderBy: { attendance: { date: 'desc' } },
      take: parseInt(limit),
    })
    return records
  },

  async getTeacherRecords(teacherId, school_id, query = {}) {
    const { limit = 30 } = query
    const records = await prisma.teacherAttendance.findMany({
      where: {
        teacher_id: teacherId,
        attendance: { school_id },
      },
      include: { attendance: true },
      orderBy: { attendance: { date: 'desc' } },
      take: parseInt(limit),
    })
    return records
  },
}
