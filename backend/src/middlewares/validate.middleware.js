import ApiError from '../utils/ApiError.js'

// Schema ka shape: z.object({ body, query, params })
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    query: req.query ?? {},
    params: req.params ?? {},
  })

  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }))
    return next(new ApiError(400, errors[0]?.message || 'Validation failed', errors))
  }

  req.validated = result.data
  next()
}