import { env } from './env.js'

export const allowedOrigins = env.CLIENT_URL.split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}