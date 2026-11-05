import ApiError from '../utils/ApiError.js'

function getBaseShape(schema) {
  let curr = schema
  while (curr && curr._def && curr._def.schema) {
    curr = curr._def.schema
  }
  return curr?.shape || null
}

// Schema shape: z.object({ body, query, params })
export const validate = (schema) => (req, res, next) => {
  const shape = getBaseShape(schema)
  const input = {}

  if (shape) {
    if ('body' in shape) input.body = req.body ?? {}
    if ('query' in shape) input.query = req.query ?? {}
    if ('params' in shape) input.params = req.params ?? {}
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
