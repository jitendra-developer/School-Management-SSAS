import { prisma } from '../config/db.js'

export const messageService = {
  async getAll(school_id, query = {}) {
    const { page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { sent_at: 'desc' },
      }),
      prisma.message.count({ where }),
    ])

    return { messages, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const message = await prisma.message.findFirst({
      where: { id, school_id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    })
    if (!message) {
      const err = new Error('Message not found')
      err.statusCode = 404
      throw err
    }
    return message
  },

  async send(data, school_id, sender_id) {
    const message = await prisma.message.create({
      data: {
        ...data,
        school_id,
        sender_id,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    })
    return message
  },

  async markRead(id, school_id) {
    const message = await prisma.message.findFirst({ where: { id, school_id } })
    if (!message) {
      const err = new Error('Message not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.message.update({
      where: { id },
      data: { read: true },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    })
    return updated
  },

  async deleteMessage(id, school_id) {
    const message = await prisma.message.findFirst({ where: { id, school_id } })
    if (!message) {
      const err = new Error('Message not found')
      err.statusCode = 404
      throw err
    }
    await prisma.message.delete({ where: { id } })
  },
}
