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
    const { class_id, status, search, page = 1, limit = 20 } = query
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

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { class: { select: { id: true, name: true, section: true } } },
        orderBy: { created_at: 'desc' },
      }),
      prisma.student.count({ where }),
    ])

    return { students, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const student = await prisma.student.findFirst({
      where: { id, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        attendance_records: {
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
