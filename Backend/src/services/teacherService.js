import { prisma } from '../config/db.js'

export const teacherService = {
  async create(data, school_id) {
    const teacher = await prisma.teacher.create({
      data: {
        ...data,
        school_id,
        dob: data.dob ? new Date(data.dob) : null,
        joining_date: data.joining_date ? new Date(data.joining_date) : new Date(),
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return teacher
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
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { class: { select: { id: true, name: true, section: true } } },
        orderBy: { created_at: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ])

    return { teachers, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        attendance_records: {
          include: { attendance: true },
          orderBy: { attendance: { date: 'desc' } },
          take: 30,
        },
      },
    })
    if (!teacher) {
      const err = new Error('Teacher not found')
      err.statusCode = 404
      throw err
    }
    return teacher
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...data,
        dob: data.dob ? new Date(data.dob) : undefined,
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return teacher
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.teacher.delete({ where: { id } })
  },
}
