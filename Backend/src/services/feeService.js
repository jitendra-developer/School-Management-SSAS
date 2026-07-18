import { prisma } from '../config/db.js'

function resolveAmount(provided, fallback) {
  if (provided !== undefined && provided !== null && provided !== '') {
    const parsed = parseFloat(provided)
    return Number.isFinite(parsed) ? parsed : (fallback || 0)
  }
  return fallback || 0
}

export const feeService = {
  async createPlan(data, school_id) {
    return prisma.feePlan.create({ data: { ...data, school_id } })
  },

  async getPlans(school_id) {
    return prisma.feePlan.findMany({ where: { school_id }, orderBy: { created_at: 'desc' } })
  },

  async updatePlan(id, data, school_id) {
    const existing = await prisma.feePlan.findFirst({ where: { id, school_id } })
    if (!existing) {
      const err = new Error('Fee plan not found')
      err.statusCode = 404
      throw err
    }
    const { name, amount, frequency, category, description, due_date } = data
    return prisma.feePlan.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
        ...(frequency !== undefined ? { frequency } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(due_date !== undefined ? { due_date } : {}),
      },
    })
  },

  async removePlan(id, school_id) {
    const existing = await prisma.feePlan.findFirst({ where: { id, school_id } })
    if (!existing) {
      const err = new Error('Fee plan not found')
      err.statusCode = 404
      throw err
    }
    await prisma.feePlan.delete({ where: { id } })
  },

  async assignFee({ student_id, plan_id, amounts, due_date }, school_id) {
    const student = await prisma.student.findFirst({ where: { id: student_id, school_id } })
    if (!student) {
      const err = new Error('Student not found')
      err.statusCode = 404
      throw err
    }

    const parsedDueDate = new Date(due_date)
    const existing = await prisma.fee.findFirst({ where: { school_id, student_id } })

    const tuition_amount = resolveAmount(amounts?.tuition, existing?.tuition_amount)
    const transport_amount = resolveAmount(amounts?.transport, existing?.transport_amount)
    const exam_amount = resolveAmount(amounts?.exam, existing?.exam_amount)
    const other_amount = resolveAmount(amounts?.other, existing?.other_amount)
    const total = tuition_amount + transport_amount + exam_amount + other_amount

    if (total <= 0) {
      const err = new Error('Enter an amount for at least one fee category')
      err.statusCode = 400
      throw err
    }

    if (existing) {
      if (total < existing.paid) {
        const err = new Error(`Total amount cannot be less than amount already paid (₹${existing.paid})`)
        err.statusCode = 400
        throw err
      }
      const status = existing.paid >= total ? 'paid' : existing.paid > 0 ? 'partial' : 'pending'
      return prisma.fee.update({
        where: { id: existing.id },
        data: { tuition_amount, transport_amount, exam_amount, other_amount, amount: total, due_date: parsedDueDate, status, plan_id: plan_id || existing.plan_id },
        include: {
          student: { select: { id: true, first_name: true, last_name: true } },
          plan: true,
        },
      })
    }

    return prisma.fee.create({
      data: {
        school_id,
        student_id,
        class_id: student.class_id,
        plan_id: plan_id || null,
        tuition_amount, transport_amount, exam_amount, other_amount,
        amount: total,
        due_date: parsedDueDate,
      },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        plan: true,
      },
    })
  },

  async updateFee(id, { tuition_amount, transport_amount, exam_amount, other_amount, due_date }, school_id) {
    const fee = await prisma.fee.findFirst({ where: { id, school_id } })
    if (!fee) {
      const err = new Error('Fee record not found')
      err.statusCode = 404
      throw err
    }

    const newTuition = resolveAmount(tuition_amount, fee.tuition_amount)
    const newTransport = resolveAmount(transport_amount, fee.transport_amount)
    const newExam = resolveAmount(exam_amount, fee.exam_amount)
    const newOther = resolveAmount(other_amount, fee.other_amount)
    const total = newTuition + newTransport + newExam + newOther

    if (total <= 0) {
      const err = new Error('Enter an amount for at least one fee category')
      err.statusCode = 400
      throw err
    }
    if (total < fee.paid) {
      const err = new Error(`Total amount cannot be less than amount already paid (₹${fee.paid})`)
      err.statusCode = 400
      throw err
    }

    const data = {
      tuition_amount: newTuition,
      transport_amount: newTransport,
      exam_amount: newExam,
      other_amount: newOther,
      amount: total,
      status: fee.paid >= total ? 'paid' : fee.paid > 0 ? 'partial' : 'pending',
    }
    if (due_date) data.due_date = new Date(due_date)

    return prisma.fee.update({
      where: { id },
      data,
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        plan: true,
        class: { select: { id: true, name: true, section: true } },
      },
    })
  },

  async recordPayment(feeId, { paid, payment_method, remark, receipt_number }, school_id) {
    const fee = await prisma.fee.findFirst({ where: { id: feeId, school_id } })
    if (!fee) {
      const err = new Error('Fee record not found')
      err.statusCode = 404
      throw err
    }

    const remaining = fee.amount - fee.paid
    if (!paid || paid <= 0) {
      const err = new Error('Payment amount must be greater than 0')
      err.statusCode = 400
      throw err
    }
    if (paid > remaining) {
      const err = new Error(`Payment exceeds remaining balance of ${remaining}`)
      err.statusCode = 400
      throw err
    }

    let finalReceiptNumber = receipt_number?.trim()
    if (finalReceiptNumber) {
      const existing = await prisma.feePayment.findFirst({ where: { school_id, receipt_number: finalReceiptNumber } })
      if (existing) {
        const err = new Error('Receipt number already exists')
        err.statusCode = 400
        throw err
      }
    } else {
      const school = await prisma.school.update({
        where: { id: school_id },
        data: { fee_receipt_seq: { increment: 1 } },
      })
      finalReceiptNumber = `RCPT-${new Date().getFullYear()}-${String(school.fee_receipt_seq).padStart(6, '0')}`
    }

    const newPaid = fee.paid + paid
    const status = newPaid >= fee.amount ? 'paid' : 'partial'
    const payment_date = new Date()

    const [payment, updatedFee] = await prisma.$transaction([
      prisma.feePayment.create({
        data: {
          school_id,
          fee_id: feeId,
          receipt_number: finalReceiptNumber,
          amount: paid,
          payment_method,
          payment_date,
          remark,
        },
      }),
      prisma.fee.update({
        where: { id: feeId },
        data: { paid: newPaid, status, payment_date, payment_method, remark },
        include: {
          student: { select: { id: true, first_name: true, last_name: true } },
          plan: true,
          class: { select: { id: true, name: true, section: true } },
        },
      }),
    ])

    return { fee: updatedFee, payment }
  },

  async getPayments(feeId, school_id) {
    const fee = await prisma.fee.findFirst({ where: { id: feeId, school_id } })
    if (!fee) {
      const err = new Error('Fee record not found')
      err.statusCode = 404
      throw err
    }
    return prisma.feePayment.findMany({ where: { fee_id: feeId, school_id }, orderBy: { payment_date: 'desc' } })
  },

  async assignFeeBatch({ student_ids, plan_id, amounts, due_date }, school_id) {
    const students = await prisma.student.findMany({
      where: { id: { in: student_ids }, school_id },
    })
    if (students.length !== student_ids.length) {
      const err = new Error('One or more students not found')
      err.statusCode = 404
      throw err
    }

    const parsedDueDate = new Date(due_date)
    const hasAny = ['tuition', 'transport', 'exam', 'other'].some((k) => {
      const v = amounts?.[k]
      return v !== undefined && v !== null && v !== '' && parseFloat(v) > 0
    })
    if (!hasAny) {
      const err = new Error('Enter an amount for at least one fee category')
      err.statusCode = 400
      throw err
    }

    const existingFees = await prisma.fee.findMany({
      where: { school_id, student_id: { in: student_ids } },
    })
    const existingByStudent = new Map(existingFees.map((f) => [f.student_id, f]))

    let created = 0
    let updated = 0
    let invalid = 0

    for (const sid of student_ids) {
      const existing = existingByStudent.get(sid)
      const tuition_amount = resolveAmount(amounts?.tuition, existing?.tuition_amount)
      const transport_amount = resolveAmount(amounts?.transport, existing?.transport_amount)
      const exam_amount = resolveAmount(amounts?.exam, existing?.exam_amount)
      const other_amount = resolveAmount(amounts?.other, existing?.other_amount)
      const total = tuition_amount + transport_amount + exam_amount + other_amount

      if (existing) {
        if (total < existing.paid) {
          invalid += 1
          continue
        }
        const status = existing.paid >= total ? 'paid' : existing.paid > 0 ? 'partial' : 'pending'
        await prisma.fee.update({
          where: { id: existing.id },
          data: { tuition_amount, transport_amount, exam_amount, other_amount, amount: total, due_date: parsedDueDate, status },
        })
        updated += 1
      } else {
        const student = students.find((s) => s.id === sid)
        await prisma.fee.create({
          data: {
            school_id,
            student_id: sid,
            class_id: student.class_id,
            plan_id: plan_id || null,
            tuition_amount, transport_amount, exam_amount, other_amount,
            amount: total,
            due_date: parsedDueDate,
          },
        })
        created += 1
      }
    }

    return { created, updated, invalid }
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
