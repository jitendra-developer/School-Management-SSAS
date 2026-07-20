import jwt from 'jsonwebtoken'

/**
 * JWT helpers — token generation and verification.
 *
 * Every token embeds the account's current `token_version`. Login and
 * logout bump that counter in the DB, so any token minted before the bump
 * fails the version check in the auth middleware — this is what makes
 * logout (and a fresh login elsewhere) actually invalidate prior tokens,
 * since JWTs are otherwise stateless and can't be revoked by themselves.
 */
export const generateToken = (id, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign({ id, v: tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.verify(token, process.env.JWT_SECRET)
}
