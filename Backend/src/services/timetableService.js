import { prisma } from '../config/db.js'

export const timetableService = {
  async getAll(school_id, query = {}) {
    const { class_id, day_of_week, page = 1, limit = 50 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (class_id) where.class_id = class_id
    if (day_of_week) where.day_of_week = parseInt(day_of_week)

    const [entries, total] = await Promise.all([
      prisma.timetableEntry.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          class: { select: { id: true, name: true, section: true } },
          teacher: { select: { id: true, first_name: true, last_name: true } },
        },
        orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }],
      }),
      prisma.timetableEntry.count({ where }),
    ])

    return { entries, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const entry = await prisma.timetableEntry.findFirst({
      where: { id, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        teacher: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    if (!entry) {
      const err = new Error('Timetable entry not found')
      err.statusCode = 404
      throw err
    }
    return entry
  },

  async create(data, school_id) {
    const entry = await prisma.timetableEntry.create({
      data: { ...data, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        teacher: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    return entry
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    const entry = await prisma.timetableEntry.update({
      where: { id },
      data,
      include: {
        class: { select: { id: true, name: true, section: true } },
        teacher: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    return entry
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.timetableEntry.delete({ where: { id } })
  },
}
