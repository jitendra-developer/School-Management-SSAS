import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.js'
import { generateToken } from '../utils/token.js'

const SALT_ROUNDS = 12

const sanitizeAdmin = (admin) => {
  const { password, ...rest } = admin
  return rest
}

/**
 * Auth business logic — register school + admin, login, profile.
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

    const token = generateToken(result.admin.id)

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

    const token = generateToken(admin.id)
    const { password: _, school, ...adminData } = admin

    return {
      token,
      admin: adminData,
      school,
    }
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
        created_at: true,
        school: {
          select: { id: true, school_name: true, email: true, phone: true },
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
}
