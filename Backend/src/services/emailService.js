import nodemailer from 'nodemailer'
import { prisma } from '../config/db.js'

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    const err = new Error('Email configuration not found. Set SMTP_* env vars.')
    err.statusCode = 500
    throw err
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const emailService = {
  async sendFeeReminder(studentId, feeId, school_id) {
    const student = await prisma.student.findFirst({ where: { id: studentId, school_id } })
    const fee = await prisma.fee.findFirst({
      where: { id: feeId, school_id },
      include: { plan: true },
    })
    const school = await prisma.school.findUnique({ where: { id: school_id } })

    if (!student || !fee) {
      const err = new Error('Student or fee record not found')
      err.statusCode = 404
      throw err
    }

    const recipientEmail = student.email
    if (!recipientEmail) {
      const err = new Error('Student has no email address')
      err.statusCode = 400
      throw err
    }

    const transporter = getTransporter()
    const dueAmount = fee.amount - fee.paid
    const studentName = `${student.first_name} ${student.last_name}`

    await transporter.sendMail({
      from: `"${school?.school_name || 'School'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Fee Reminder - ${school?.school_name || 'School'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Fee Payment Reminder</h2>
          <p>Dear ${studentName},</p>
          <p>This is a reminder regarding your pending fee payment:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Total Fee:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${fee.amount}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${fee.paid}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Due Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${dueAmount}</td></tr>
            <tr><td style="padding: 8px;"><strong>Due Date:</strong></td><td style="padding: 8px;">${fee.due_date.toLocaleDateString()}</td></tr>
          </table>
          <p style="margin-top: 20px;">Please make the payment at your earliest convenience.</p>
          <p>Thank you,<br/>${school?.school_name || 'School Management'}</p>
        </div>
      `,
    })

    return { sent: true, recipient: recipientEmail, studentName }
  },

  async sendBulkFeeReminders(school_id) {
    const now = new Date()
    const pendingFees = await prisma.fee.findMany({
      where: {
        school_id,
        status: { in: ['pending', 'partial'] },
        due_date: { lte: now },
        student: { email: { not: null } },
      },
      include: {
        student: { select: { id: true, first_name: true, last_name: true, email: true } },
        plan: true,
      },
    })

    const results = []
    for (const fee of pendingFees) {
      try {
        await this.sendFeeReminder(fee.student_id, fee.id, school_id)
        results.push({ studentId: fee.student_id, status: 'sent' })
      } catch {
        results.push({ studentId: fee.student_id, status: 'failed' })
      }
    }

    return { total: pendingFees.length, sent: results.filter((r) => r.status === 'sent').length, failed: results.filter((r) => r.status === 'failed').length }
  },
}
