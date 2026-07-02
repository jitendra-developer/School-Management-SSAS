import { prisma } from '../config/db.js'

export const studentService = {
  async create(data, school_id) {
    const student = await prisma.student.create({
      data: {
        ...data,
        school_id,
        dob: data.dob ? new Date(data.dob) : null,
        enrollment_date: data.enrollment_date ? new Date(data.enrollment_date) : new Date(),
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return student
  },

  async getAll(school_id, query = {}) {
    const { class_id, status, search, page = 1, limit = 20, fee_status } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (class_id) where.class_id = class_id
    if (status) where.status = status
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { roll_number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (fee_status) {
      where.fees = { some: { status: fee_status } }
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          class: { select: { id: true, name: true, section: true } },
          _count: { select: { student_attendance: true } },
        },
        orderBy: { created_at: 'desc' },
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

  async getById(id, school_id) {
    const student = await prisma.student.findFirst({
      where: { id, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        student_attendance: {
          include: { attendance: true },
          orderBy: { attendance: { date: 'desc' } },
          take: 30,
        },
        fees: {
          include: { plan: true },
          orderBy: { due_date: 'desc' },
        },
      },
    })
    if (!student) {
      const err = new Error('Student not found')
      err.statusCode = 404
      throw err
    }
    return student
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        dob: data.dob ? new Date(data.dob) : undefined,
        enrollment_date: data.enrollment_date ? new Date(data.enrollment_date) : undefined,
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return student
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.student.delete({ where: { id } })
  },
}
