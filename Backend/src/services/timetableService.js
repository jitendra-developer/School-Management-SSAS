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

    return { timetable: entries, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
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
    await this.checkConflicts(data, school_id)
    const entry = await prisma.timetableEntry.create({
      data: { ...data, school_id, teacher_id: data.teacher_id || null, room: data.room || null },
      include: {
        class: { select: { id: true, name: true, section: true } },
        teacher: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    return entry
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    await this.checkConflicts(data, school_id, id)
    const entry = await prisma.timetableEntry.update({
      where: { id },
      data: { ...data, teacher_id: data.teacher_id || null, room: data.room || null },
      include: {
        class: { select: { id: true, name: true, section: true } },
        teacher: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    return entry
  },

  async checkConflicts(data, school_id, excludeId) {
    const { class_id, subject, day_of_week, teacher_id, start_time, end_time } = data
    const whereClause = { school_id, day_of_week, id: excludeId ? { not: excludeId } : undefined }

    if (class_id && subject) {
      const duplicate = await prisma.timetableEntry.findFirst({
        where: { ...whereClause, class_id, subject },
      })
      if (duplicate) {
        const err = new Error('This class already has this subject scheduled on the selected day')
        err.statusCode = 409
        throw err
      }
    }

    if (teacher_id && start_time && end_time) {
      const teacherBusy = await prisma.timetableEntry.findFirst({
        where: {
          ...whereClause,
          teacher_id,
          start_time: { lt: end_time },
          end_time: { gt: start_time },
        },
      })
      if (teacherBusy) {
        const err = new Error('This teacher already has a class scheduled during this time')
        err.statusCode = 409
        throw err
      }
    }
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.timetableEntry.delete({ where: { id } })
  },
}
