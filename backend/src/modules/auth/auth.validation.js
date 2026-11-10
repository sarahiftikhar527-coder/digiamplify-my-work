import { z } from 'zod'

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
})

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Full name is required').max(100),
    email: z.string().trim().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.string().trim().max(50).optional(),
    pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
})