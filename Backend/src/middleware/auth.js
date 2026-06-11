import { prisma } from '../config/db.js'
import { errorResponse } from '../utils/apiResponse.js'
import { verifyToken } from '../utils/token.js'

/**
 * Protects routes — expects Bearer token in Authorization header.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

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
