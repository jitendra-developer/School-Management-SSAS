import { prisma } from '../config/db.js'

export const reportService = {
  async dashboardStats(school_id) {
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalFees,
      collectedFees,
      pendingFees,
      totalClasses,
    ] = await Promise.all([
      prisma.student.count({ where: { school_id } }),
      prisma.student.count({ where: { school_id, status: 'active' } }),
      prisma.teacher.count({ where: { school_id } }),
      prisma.teacher.count({ where: { school_id, status: 'active' } }),
      prisma.fee.aggregate({ where: { school_id }, _sum: { amount: true } }),
      prisma.fee.aggregate({ where: { school_id }, _sum: { paid: true } }),
      prisma.fee.count({ where: { school_id, status: { in: ['pending', 'partial'] } } }),
      prisma.class.count({ where: { school_id } }),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = await prisma.attendance.findUnique({
      where: { school_id_date_type: { school_id, date: today, type: 'student' } },
      include: { _count: { select: { student_attendance: true } } },
    })

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      totalFeesAmount: totalFees._sum.amount || 0,
      totalCollected: collectedFees._sum.paid || 0,
      pendingFeesCount: pendingFees,
      pendingFeesAmount: (totalFees._sum.amount || 0) - (collectedFees._sum.paid || 0),
      todayAttendance: todayAttendance?._count?.student_attendance || 0,
      collectionRate: totalFees._sum.amount
        ? Math.round((((collectedFees._sum.paid || 0) / totalFees._sum.amount) * 100) * 100) / 100
        : 0,
    }
  },

  async feeReport(school_id, query = {}) {
    const { start_date, end_date, class_id } = query
    const where = { school_id }
    if (class_id) where.class_id = class_id
    if (start_date) where.created_at = { gte: new Date(start_date) }
    if (end_date) where.created_at = { ...where.created_at, lte: new Date(end_date) }

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        class: { select: { id: true, name: true, section: true } },
        plan: true,
      },
      orderBy: { created_at: 'desc' },
    })

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0)
    const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0)
    const pending = fees.filter((f) => f.status !== 'paid')
    const collected = fees.filter((f) => f.status === 'paid')

    return {
      summary: { totalFees: fees.length, totalAmount, totalPaid, pendingAmount: totalAmount - totalPaid, collectionRate: totalAmount ? Math.round((totalPaid / totalAmount) * 10000) / 100 : 0 },
      classWise: await this._classWiseFees(school_id),
      recentPayments: collected.slice(0, 10),
      pendingFees: pending.slice(0, 10),
    }
  },

  async _classWiseFees(school_id) {
    const classes = await prisma.class.findMany({
      where: { school_id },
      include: {
        fees: { select: { amount: true, paid: true, status: true } },
      },
    })
    return classes.map((c) => ({
      class: c.name + (c.section ? ` ${c.section}` : ''),
      totalFees: c.fees.reduce((s, f) => s + f.amount, 0),
      totalPaid: c.fees.reduce((s, f) => s + f.paid, 0),
      pendingCount: c.fees.filter((f) => f.status !== 'paid').length,
      paidCount: c.fees.filter((f) => f.status === 'paid').length,
    }))
  },

  async attendanceReport(school_id, query = {}) {
    const { start_date, end_date, class_id } = query
    const dateFilter = {}
    if (start_date) dateFilter.gte = new Date(start_date)
    if (end_date) dateFilter.lte = new Date(end_date)

    const where = { school_id, type: 'student' }
    if (start_date || end_date) where.date = dateFilter

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student_attendance: true,
      },
      orderBy: { date: 'desc' },
    })

    let totalPresent = 0
    let totalAbsent = 0
    let totalLate = 0

    for (const r of records) {
      for (const sa of r.student_attendance) {
        if (sa.status === 'present') totalPresent++
        else if (sa.status === 'absent') totalAbsent++
        else if (sa.status === 'late') totalLate++
      }
    }

    const totalRecords = totalPresent + totalAbsent + totalLate

    return {
      summary: {
        totalDays: records.length,
        totalRecords,
        totalPresent,
        totalAbsent,
        totalLate,
        attendanceRate: totalRecords ? Math.round((totalPresent / totalRecords) * 10000) / 100 : 0,
      },
      daily: records.slice(0, 30).map((r) => ({
        date: r.date,
        present: r.student_attendance.filter((sa) => sa.status === 'present').length,
        absent: r.student_attendance.filter((sa) => sa.status === 'absent').length,
        late: r.student_attendance.filter((sa) => sa.status === 'late').length,
      })),
    }
  },

  async studentReport(school_id, query = {}) {
    const { class_id, status } = query
    const where = { school_id }
    if (class_id) where.class_id = class_id
    if (status) where.status = status

    const students = await prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, section: true } },
        _count: { select: { attendance_records: true, fees: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    return {
      total: students.length,
      byClass: await this._studentByClass(school_id),
      recentAdmissions: students.slice(0, 10),
    }
  },

  async _studentByClass(school_id) {
    const classes = await prisma.class.findMany({
      where: { school_id },
      include: { _count: { select: { students: true } } },
    })
    return classes.map((c) => ({
      class: c.name + (c.section ? ` ${c.section}` : ''),
      count: c._count.students,
    }))
  },
}
