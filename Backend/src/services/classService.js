import { prisma } from '../config/db.js'

export const classService = {
  async create(data, school_id) {
    const cls = await prisma.class.create({
      data: { ...data, school_id },
      include: { _count: { select: { students: true } } },
    })
    return cls
  },

  async getAll(school_id) {
    const classes = await prisma.class.findMany({
      where: { school_id },
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    })
    return classes
  },

  async getById(id, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
      include: { _count: { select: { students: true } } },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    return cls
  },

  async remove(id, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
      include: { _count: { select: { students: true } } },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    await prisma.class.delete({ where: { id } })
    return cls
  },

  async getStudents(id, school_id, query = {}) {
    await this.getById(id, school_id)

    const { status, search, page = 1, limit = 50 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id, class_id: id }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { first_name: 'asc' },
        include: { _count: { select: { student_attendance: true } } },
      }),
      prisma.student.count({ where }),
    ])

    const studentIds = students.map((s) => s.id)
    const presentCounts = studentIds.length
      ? await prisma.studentAttendance.groupBy({
          by: ['student_id'],
          where: { student_id: { in: studentIds }, status: 'present' },
          _count: { id: true },
        })
      : []

    const presentMap = Object.fromEntries(
      presentCounts.map((r) => [r.student_id, r._count.id])
    )

    const studentsWithAttendance = students.map((s) => ({
      ...s,
      attendance_percentage:
        s._count.student_attendance > 0
          ? Math.round(((presentMap[s.id] || 0) / s._count.student_attendance) * 100)
          : null,
    }))

    return { students: studentsWithAttendance, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },
}
