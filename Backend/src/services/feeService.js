import { prisma } from '../config/db.js'

export const feeService = {
  async createPlan(data, school_id) {
    return prisma.feePlan.create({ data: { ...data, school_id } })
  },

  async getPlans(school_id) {
    return prisma.feePlan.findMany({ where: { school_id }, orderBy: { created_at: 'desc' } })
  },

  async assignFee({ student_id, plan_id, amount, due_date }, school_id) {
    const student = await prisma.student.findFirst({ where: { id: student_id, school_id } })
    if (!student) {
      const err = new Error('Student not found')
      err.statusCode = 404
      throw err
    }

    return prisma.fee.create({
      data: {
        school_id,
        student_id,
        class_id: student.class_id,
        plan_id: plan_id || null,
        amount,
        due_date: new Date(due_date),
      },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        plan: true,
      },
    })
  },

  async recordPayment(feeId, { paid, payment_method, remark }, school_id) {
    const fee = await prisma.fee.findFirst({ where: { id: feeId, school_id } })
    if (!fee) {
      const err = new Error('Fee record not found')
      err.statusCode = 404
      throw err
    }

    const newPaid = fee.paid + paid
    const status = newPaid >= fee.amount ? 'paid' : fee.status === 'paid' ? 'paid' : 'partial'

    return prisma.fee.update({
      where: { id: feeId },
      data: {
        paid: newPaid,
        status,
        payment_date: new Date(),
        payment_method,
        remark,
      },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        plan: true,
      },
    })
  },

  async assignFeeBatch({ student_ids, plan_id, amount, due_date }, school_id) {
    const students = await prisma.student.findMany({
      where: { id: { in: student_ids }, school_id },
    })
    if (students.length !== student_ids.length) {
      const err = new Error('One or more students not found')
      err.statusCode = 404
      throw err
    }

    const data = student_ids.map((sid) => {
      const student = students.find((s) => s.id === sid)
      return {
        school_id,
        student_id: sid,
        class_id: student.class_id,
        plan_id: plan_id || null,
        amount: parseFloat(amount),
        due_date: new Date(due_date),
      }
    })

    await prisma.fee.createMany({ data })
    return { count: data.length }
  },

  async getFees(school_id, query = {}) {
    const { status, class_id, student_id, search, page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }
    if (status) where.status = status
    if (class_id) where.class_id = class_id
    if (student_id) where.student_id = student_id
    if (search) {
      where.student = {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          student: { select: { id: true, first_name: true, last_name: true } },
          plan: true,
          class: { select: { id: true, name: true, section: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.fee.count({ where }),
    ])

    return { fees, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async getById(id, school_id) {
    const fee = await prisma.fee.findFirst({
      where: { id, school_id },
      include: {
        student: { select: { id: true, first_name: true, last_name: true, email: true, parent_phone: true } },
        plan: true,
        class: { select: { id: true, name: true, section: true } },
      },
    })
    if (!fee) {
      const err = new Error('Fee record not found')
      err.statusCode = 404
      throw err
    }
    return fee
  },

  async getPendingFees(school_id, query = {}) {
    const { class_id, page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const now = new Date()

    const where = { school_id, status: { in: ['pending', 'partial'] }, due_date: { lte: now } }
    if (class_id) where.class_id = class_id

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          student: { select: { id: true, first_name: true, last_name: true, email: true, parent_name: true, parent_phone: true } },
          plan: true,
          class: { select: { id: true, name: true, section: true } },
        },
        orderBy: { due_date: 'asc' },
      }),
      prisma.fee.count({ where }),
    ])

    return { fees, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },
}
