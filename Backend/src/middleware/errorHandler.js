/**
 * Global error handler — must be registered last in Express app.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.code === 'P2002') {
    statusCode = 409
    const target = err.meta?.target || []
    if (target.includes('name') && target.includes('section')) {
      message = 'A class with this name and section already exists'
    } else {
      message = 'A record with this value already exists'
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
