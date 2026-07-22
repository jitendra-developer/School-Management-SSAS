import { prisma } from '../config/db.js'

export const libraryService = {
  async getBooks(school_id, query = {}) {
    const { search, page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ])

    return { books, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async createBook(data, school_id) {
    const book = await prisma.book.create({
      data: {
        ...data,
        school_id,
        available: data.quantity ?? data.available ?? 1,
      },
    })
    return book
  },

  async updateBook(id, data, school_id) {
    const book = await prisma.book.findFirst({ where: { id, school_id } })
    if (!book) {
      const err = new Error('Book not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.book.update({
      where: { id },
      data,
    })
    return updated
  },

  async deleteBook(id, school_id) {
    const book = await prisma.book.findFirst({ where: { id, school_id } })
    if (!book) {
      const err = new Error('Book not found')
      err.statusCode = 404
      throw err
    }
    await prisma.book.delete({ where: { id } })
  },

  async getIssues(school_id, query = {}) {
    const { page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }

    const [issues, total] = await Promise.all([
      prisma.bookIssue.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          book: { select: { id: true, title: true, author: true } },
          student: { select: { id: true, first_name: true, last_name: true } },
        },
        orderBy: { issue_date: 'desc' },
      }),
      prisma.bookIssue.count({ where }),
    ])

    return { issues, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async issueBook(data, school_id) {
    const book = await prisma.book.findUnique({ where: { id: data.book_id } })
    if (!book || book.available < 1) {
      const err = new Error('Book not available')
      err.statusCode = 400
      throw err
    }

    const [issue] = await Promise.all([
      prisma.bookIssue.create({
        data: {
          ...data,
          school_id,
          due_date: data.due_date ? new Date(data.due_date) : new Date(),
        },
        include: {
          book: { select: { id: true, title: true } },
          student: { select: { id: true, first_name: true, last_name: true } },
        },
      }),
      prisma.book.update({
        where: { id: data.book_id },
        data: { available: { decrement: 1 } },
      }),
    ])
    return issue
  },

  async returnBook(id, school_id) {
    const issue = await prisma.bookIssue.findFirst({ where: { id, school_id } })
    if (!issue) {
      const err = new Error('Issue not found')
      err.statusCode = 404
      throw err
    }

    const [updated] = await Promise.all([
      prisma.bookIssue.update({
        where: { id },
        data: { return_date: new Date(), status: 'returned' },
        include: {
          book: { select: { id: true, title: true } },
          student: { select: { id: true, first_name: true, last_name: true } },
        },
      }),
      prisma.book.update({
        where: { id: issue.book_id },
        data: { available: { increment: 1 } },
      }),
    ])
    return updated
  },

  async updateIssue(id, { due_date }, school_id) {
    const issue = await prisma.bookIssue.findFirst({ where: { id, school_id } })
    if (!issue) {
      const err = new Error('Issue not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.bookIssue.update({
      where: { id },
      data: { due_date: new Date(due_date) },
      include: {
        book: { select: { id: true, title: true } },
        student: { select: { id: true, first_name: true, last_name: true } },
      },
    })
    return updated
  },

  async deleteIssue(id, school_id) {
    const issue = await prisma.bookIssue.findFirst({ where: { id, school_id } })
    if (!issue) {
      const err = new Error('Issue not found')
      err.statusCode = 404
      throw err
    }
    if (issue.status !== 'returned') {
      await prisma.book.update({
        where: { id: issue.book_id },
        data: { available: { increment: 1 } },
      })
    }
    await prisma.bookIssue.delete({ where: { id } })
  },
}
