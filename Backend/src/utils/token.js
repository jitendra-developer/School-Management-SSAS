import jwt from 'jsonwebtoken'

/**
 * JWT helpers — token generation and verification.
 */
export const generateToken = (adminId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.verify(token, process.env.JWT_SECRET)
}
