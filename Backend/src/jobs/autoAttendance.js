import cron from 'node-cron'
import { prisma } from '../config/db.js'

const runAutoMark = async () => {
  console.log('[AutoAttendance] Running end-of-day auto-mark...')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const schools = await prisma.school.findMany({ select: { id: true } })

  for (const school of schools) {
    const existing = await prisma.attendance.findUnique({
      where: { school_id_date_type: { school_id: school.id, date: today, type: 'student' } },
    })

    if (existing) {
      console.log(`[AutoAttendance] School ${school.id} — already marked, skipping`)
      continue
    }

    const students = await prisma.student.findMany({
      where: { school_id: school.id, status: 'active' },
      select: { id: true },
    })

    if (!students.length) {
      console.log(`[AutoAttendance] School ${school.id} — no active students, skipping`)
      continue
    }

    const attendance = await prisma.attendance.create({
      data: { school_id: school.id, date: today, type: 'student' },
    })

    await prisma.studentAttendance.createMany({
      data: students.map((s) => ({
        attendance_id: attendance.id,
        student_id: s.id,
        status: 'present',
      })),
      skipDuplicates: true,
    })

    console.log(`[AutoAttendance] School ${school.id} — marked ${students.length} students as present`)
  }

  console.log('[AutoAttendance] End-of-day auto-mark complete')
}

export const startAutoAttendanceJob = () => {
  // Schedule: 11:59 PM every day
  cron.schedule('59 23 * * *', () => {
    runAutoMark()
  })

  console.log('[AutoAttendance] Cron job scheduled for 11:59 PM daily')
}
