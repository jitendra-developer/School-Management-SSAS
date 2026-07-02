import { prisma } from '../config/db.js'
import { errorResponse } from '../utils/apiResponse.js'
import { verifyToken } from '../utils/token.js'

const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1]
  }
  if (req.cookies?.token) {
    return req.cookies.token
  }
  return null
}

/**
 * Protects admin routes — expects Bearer token in Authorization header.
 */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return errorResponse(res, { message: 'Not authorized — no token', statusCode: 401 })
    }

    const decoded = verifyToken(token)
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        school_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        school: {
          select: {
            id: true,
            school_name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!admin) {
      return errorResponse(res, { message: 'Admin not found', statusCode: 401 })
    }

    req.admin = admin
    next()
  } catch {
    return errorResponse(res, { message: 'Not authorized — invalid token', statusCode: 401 })
  }
}

/**
 * Protects routes accessible by either admin or teacher.
 * Sets req.admin (if admin) or req.teacher (if teacher).
 */
export const protectAdminOrTeacher = async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (!token) {
      return errorResponse(res, { message: 'Not authorized — no token', statusCode: 401 })
    }

    const decoded = verifyToken(token)

    // Try admin first
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, school_id: true, name: true, email: true, role: true },
    })
    if (admin) {
      req.admin = admin
      return next()
    }

    // Fall back to teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: decoded.id },
      select: { id: true, school_id: true, first_name: true, last_name: true, email: true, class_id: true },
    })
    if (teacher) {
      req.teacher = teacher
      return next()
    }

    return errorResponse(res, { message: 'Not authorized — user not found', statusCode: 401 })
  } catch {
    return errorResponse(res, { message: 'Not authorized — invalid token', statusCode: 401 })
  }
}

/**
 * Protects teacher routes — expects Bearer token in Authorization header.
 */
export const protectTeacher = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return errorResponse(res, { message: 'Not authorized — no token', statusCode: 401 })
    }

    const decoded = verifyToken(token)
    const teacher = await prisma.teacher.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        school_id: true,
        first_name: true,
        last_name: true,
        email: true,
        subject: true,
        phone: true,
        class_id: true,
        class: { select: { id: true, name: true, section: true } },
      },
    })

    if (!teacher) {
      return errorResponse(res, { message: 'Teacher not found', statusCode: 401 })
    }

    req.teacher = teacher
    next()
  } catch {
    return errorResponse(res, { message: 'Not authorized — invalid token', statusCode: 401 })
  }
}
