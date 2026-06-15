import { prisma } from '../config/db.js'

export const examService = {
  async getAll(school_id, query = {}) {
    const { class_id, page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (class_id) where.class_id = class_id

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { class: { select: { id: true, name: true, section: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.exam.count({ where }),
    ])

    return { exams, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const exam = await prisma.exam.findFirst({
      where: { id, school_id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        results: {
          include: {
            student: { select: { id: true, first_name: true, last_name: true } },
          },
        },
      },
    })
    if (!exam) {
      const err = new Error('Exam not found')
      err.statusCode = 404
      throw err
    }
    return exam
  },

  async create(data, school_id) {
    const exam = await prisma.exam.create({
      data: {
        ...data,
        school_id,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return exam
  },

  async update(id, data, school_id) {
    await this.getById(id, school_id)
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { class: { select: { id: true, name: true, section: true } } },
    })
    return exam
  },

  async remove(id, school_id) {
    await this.getById(id, school_id)
    await prisma.exam.delete({ where: { id } })
  },

  async recordResult(exam_id, student_id, marks_obtained, grade) {
    const result = await prisma.examResult.upsert({
      where: { exam_id_student_id: { exam_id, student_id } },
      update: { marks_obtained, grade },
      create: { exam_id, student_id, marks_obtained, grade },
    })
    return result
  },

  async getResults(exam_id) {
    const results = await prisma.examResult.findMany({
      where: { exam_id },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: { student: { first_name: 'asc' } },
    })
    return results
  },
}
