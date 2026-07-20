import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../config/db.js'
import { generateToken } from '../utils/token.js'
import { cloudinary } from '../config/cloudinary.js'
import { emailService } from './emailService.js'

const SALT_ROUNDS = 12
const OTP_EXPIRY_MINUTES = 15
const LOGIN_OTP_EXPIRY_MINUTES = 10

const sanitizeAdmin = (admin) => {
  const { password, token_version, ...rest } = admin
  return rest
}

/**
 * Auth business logic — register, login, profile, password management.
 */
export const authService = {
  async register({ school_name, school_email, phone, name, email, password }) {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } })
    if (existingAdmin) {
      const err = new Error('Admin email already registered')
      err.statusCode = 409
      throw err
    }

    const existingSchool = await prisma.school.findUnique({ where: { email: school_email } })
    if (existingSchool) {
      const err = new Error('School email already registered')
      err.statusCode = 409
      throw err
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          school_name,
          email: school_email,
          phone: phone || null,
        },
      })

      const admin = await tx.admin.create({
        data: {
          school_id: school.id,
          name,
          email,
          password: hashedPassword,
          role: 'super_admin',
        },
      })

      return { school, admin }
    })

    const token = generateToken(result.admin.id, result.admin.token_version)

    return {
      token,
      admin: sanitizeAdmin(result.admin),
      school: result.school,
    }
  },

  async login({ email, password }) {
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        school: {
          select: { id: true, school_name: true, email: true, phone: true },
        },
      },
    })

    if (!admin) {
      const err = new Error('Invalid email or password')
      err.statusCode = 401
      throw err
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      const err = new Error('Invalid email or password')
      err.statusCode = 401
      throw err
    }

    // Password verified — now require an OTP before issuing a token.
    const otp = crypto.randomInt(100000, 999999).toString()

    await prisma.loginOtp.updateMany({
      where: { admin_id: admin.id, used: false },
      data: { used: true },
    })

    await prisma.loginOtp.create({
      data: {
        admin_id: admin.id,
        otp,
        expires_at: new Date(Date.now() + LOGIN_OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    })

    try {
      await emailService.sendLoginOtpEmail(admin, admin.school, otp)
    } catch {
      const err = new Error('Failed to send OTP email. Please try again.')
      err.statusCode = 500
      throw err
    }

    return {
      requiresOtp: true,
      email: admin.email,
      message: 'OTP sent to your registered email',
    }
  },

  async verifyLoginOtp({ email, otp }) {
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        school: {
          select: { id: true, school_name: true, email: true, phone: true },
        },
      },
    })

    if (!admin) {
      const err = new Error('Invalid request')
      err.statusCode = 400
      throw err
    }

    const record = await prisma.loginOtp.findFirst({
      where: {
        admin_id: admin.id,
        otp,
        used: false,
        expires_at: { gte: new Date() },
      },
    })

    if (!record) {
      const err = new Error('Invalid or expired OTP')
      err.statusCode = 400
      throw err
    }

    await prisma.loginOtp.update({
      where: { id: record.id },
      data: { used: true },
    })

    // Bumping token_version invalidates any token issued by a previous
    // login (e.g. on another device), so each login is a fresh session.
    const { token_version } = await prisma.admin.update({
      where: { id: admin.id },
      data: { token_version: { increment: 1 } },
      select: { token_version: true },
    })

    const token = generateToken(admin.id, token_version)
    const { password: _, token_version: __, school, ...adminData } = admin

    return {
      token,
      admin: adminData,
      school,
    }
  },

  async logout(adminId) {
    await prisma.admin.update({
      where: { id: adminId },
      data: { token_version: { increment: 1 } },
    })
    return { message: 'Logged out successfully' }
  },

  async getProfile(adminId) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        school_id: true,
        name: true,
        email: true,
        role: true,
        profile_image: true,
        created_at: true,
        school: {
          select: { id: true, school_name: true, email: true, phone: true, address: true, logo: true },
        },
      },
    })

    if (!admin) {
      const err = new Error('Admin not found')
      err.statusCode = 404
      throw err
    }

    return { admin, school: admin.school }
  },

  async updateProfile(adminId, { name, email, phone }) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin) {
      const err = new Error('Admin not found')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        school_id: true,
        name: true,
        email: true,
        role: true,
        profile_image: true,
        created_at: true,
        school: {
          select: { id: true, school_name: true, email: true, phone: true, address: true, logo: true },
        },
      },
    })

    if (phone && updated.school) {
      await prisma.school.update({
        where: { id: updated.school_id },
        data: { phone },
      })
      updated.school.phone = phone
    }

    return { admin: updated, school: updated.school }
  },

  async uploadProfileImage(adminId, file) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin) {
      const err = new Error('Admin not found')
      err.statusCode = 404
      throw err
    }

    if (!file) {
      const err = new Error('No file provided')
      err.statusCode = 400
      throw err
    }

    let imageUrl = null
    if (process.env.CLOUDINARY_NAME) {
      const b64 = Buffer.from(file.buffer).toString('base64')
      const dataUri = `data:${file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'bright-future/profiles',
        width: 300,
        height: 300,
        crop: 'fill',
      })
      imageUrl = result.secure_url
    } else {
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: { profile_image: imageUrl },
      select: {
        id: true,
        school_id: true,
        name: true,
        email: true,
        role: true,
        profile_image: true,
        created_at: true,
        school: {
          select: { id: true, school_name: true, email: true, phone: true, address: true, logo: true },
        },
      },
    })

    return { admin: updated, school: updated.school }
  },

  async teacherLogin({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email and password are required')
      err.statusCode = 400
      throw err
    }

    const teacher = await prisma.teacher.findFirst({
      where: { email },
      include: {
        class: { select: { id: true, name: true, section: true } },
        school: { select: { id: true, school_name: true } },
      },
    })

    if (!teacher || !teacher.password) {
      const err = new Error('Invalid email or password')
      err.statusCode = 401
      throw err
    }

    const isMatch = await bcrypt.compare(password, teacher.password)
    if (!isMatch) {
      const err = new Error('Invalid email or password')
      err.statusCode = 401
      throw err
    }

    const { token_version } = await prisma.teacher.update({
      where: { id: teacher.id },
      data: { token_version: { increment: 1 } },
      select: { token_version: true },
    })

    const token = generateToken(teacher.id, token_version)
    const { password: _, token_version: __, ...teacherData } = teacher

    return {
      token,
      teacher: teacherData,
    }
  },

  async teacherLogout(teacherId) {
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { token_version: { increment: 1 } },
    })
    return { message: 'Logged out successfully' }
  },

  async changePassword(adminId, { currentPassword, newPassword }) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin) {
      const err = new Error('Admin not found')
      err.statusCode = 404
      throw err
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) {
      const err = new Error('Current password is incorrect')
      err.statusCode = 400
      throw err
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    })

    return { message: 'Password changed successfully' }
  },

  async forgotPassword({ email }) {
    if (!email) {
      const err = new Error('Email is required')
      err.statusCode = 400
      throw err
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return { message: 'If an account with that email exists, an OTP has been sent.' }
    }

    const otp = crypto.randomInt(100000, 999999).toString()

    await prisma.passwordResetToken.updateMany({
      where: { admin_id: admin.id, used: false },
      data: { used: true },
    })

    await prisma.passwordResetToken.create({
      data: {
        admin_id: admin.id,
        otp,
        expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    })

    try {
      const { default: nodemailer } = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Bright Future" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset OTP - Bright Future',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Password Reset</h2>
            <p>You requested a password reset. Use the OTP below:</p>
            <div style="font-size: 32px; font-weight: bold; color: #6366f1; text-align: center; padding: 20px; letter-spacing: 8px; background: #f4f6fc; border-radius: 12px; margin: 16px 0;">
              ${otp}
            </div>
            <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      })
    } catch {
      // Email sending failed silently — still return success for security
    }

    return { message: 'If an account with that email exists, an OTP has been sent.' }
  },

  async verifyOtp({ email, otp }) {
    if (!email || !otp) {
      const err = new Error('Email and OTP are required')
      err.statusCode = 400
      throw err
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      const err = new Error('Invalid request')
      err.statusCode = 400
      throw err
    }

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        admin_id: admin.id,
        otp,
        used: false,
        expires_at: { gte: new Date() },
      },
    })

    if (!token) {
      const err = new Error('Invalid or expired OTP')
      err.statusCode = 400
      throw err
    }

    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { used: true },
    })

    const resetToken = crypto.randomBytes(32).toString('hex')

    await prisma.passwordResetToken.create({
      data: {
        admin_id: admin.id,
        otp: resetToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    return { message: 'OTP verified', reset_token: resetToken }
  },

  async resetPassword({ email, reset_token, newPassword }) {
    if (!email || !reset_token || !newPassword) {
      const err = new Error('Email, reset token, and new password are required')
      err.statusCode = 400
      throw err
    }

    if (newPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters')
      err.statusCode = 400
      throw err
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      const err = new Error('Invalid request')
      err.statusCode = 400
      throw err
    }

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        admin_id: admin.id,
        otp: reset_token,
        used: false,
        expires_at: { gte: new Date() },
      },
    })

    if (!token) {
      const err = new Error('Invalid or expired reset token')
      err.statusCode = 400
      throw err
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await prisma.$transaction([
      prisma.admin.update({
        where: { id: admin.id },
        // Also bump token_version — if the account was compromised (hence
        // the reset), this kills any token an attacker may be holding.
        data: { password: hashedPassword, token_version: { increment: 1 } },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { used: true },
      }),
    ])

    return { message: 'Password reset successful' }
  },
}
