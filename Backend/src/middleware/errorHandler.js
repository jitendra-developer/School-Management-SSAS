/**
 * Global error handler — must be registered last in Express app.
 *
 * Errors we throw deliberately (with an explicit statusCode, e.g. via
 * `err.statusCode = 400`) are "operational" — their message is safe to show
 * to the client. Anything else (a bug, an unhandled Prisma/DB error, etc.)
 * is unexpected, so in production we hide the raw message and log it
 * server-side instead of leaking internals to the client.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  const isOperational = Boolean(err.statusCode)

  if (err.code === 'P2002') {
    statusCode = 409
    const target = err.meta?.target || []
    if (target.includes('name') && target.includes('section')) {
      message = 'A class with this name and section already exists'
    } else {
      message = 'A record with this value already exists'
    }
  } else if (err.code === 'P2025') {
    statusCode = 404
    message = 'Record not found'
  } else if (!isOperational && process.env.NODE_ENV === 'production') {
    statusCode = statusCode >= 500 ? 500 : statusCode
    message = statusCode >= 500 ? 'Something went wrong. Please try again later.' : message
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
