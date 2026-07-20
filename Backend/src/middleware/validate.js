/**
 * Validates a request against a Zod schema before it reaches the controller.
 * `source` picks which part of the request to validate/replace ('body' by
 * default; pass 'query' or 'params' for those).
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source])

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
      .join('; ')
    const err = new Error(message)
    err.statusCode = 400
    return next(err)
  }

  req[source] = result.data
  next()
}
