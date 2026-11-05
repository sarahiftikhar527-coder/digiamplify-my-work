import ApiError from '../utils/ApiError.js'

// Schema shape: z.object({ body, query, params })
export const validate = (schema) => (req, res, next) => {
  const input = {}

  if (schema?.shape) {
    if ('body' in schema.shape) input.body = req.body ?? {}
    if ('query' in schema.shape) input.query = req.query ?? {}
    if ('params' in schema.shape) input.params = req.params ?? {}
  } else {
    input.body = req.body ?? {}
    input.query = req.query ?? {}
    input.params = req.params ?? {}
  }

  const result = schema.safeParse(input)

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

export default validate
