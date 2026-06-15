import { prisma } from '../config/db.js'

export const noticeService = {
  async getAll(school_id, query = {}) {
    const { search, page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { publish_date: 'desc' },
      }),
      prisma.notice.count({ where }),
    ])

    return { notices, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const notice = await prisma.notice.findFirst({
      where: { id, school_id },
    })
    if (!notice) {
      const err = new Error('Notice not found')
      err.statusCode = 404
      throw err
    }
    return notice
  },

  async create(data, school_id) {
    const notice = await prisma.notice.create({
      data: {
        ...data,
        school_id,
        publish_date: data.publish_date ? new Date(data.publish_date) : new Date(),
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      },
    })
    return notice
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    const notice = await prisma.notice.update({
      where: { id },
      data: {
        ...data,
        publish_date: data.publish_date ? new Date(data.publish_date) : undefined,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      },
    })
    return notice
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.notice.delete({ where: { id } })
  },
}
