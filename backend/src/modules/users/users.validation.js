import { z } from 'zod'
import { ROLES } from '../../constants/roles.js'

const objectId = z.string().trim().min(1, 'Invalid id')

export const idSchema = z.object({ params: z.object({ id: objectId }) })

export const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: z.enum(Object.values(ROLES)).optional(),
    search: z.string().trim().max(100).optional(),
  }),
})


export const createSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().trim().max(30).optional(),
    department: z.string().trim().max(100).optional(),
    designation: z.string().trim().max(100).optional(),
  }),
});


export const updateSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    password: z.string().min(8).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    phone: z.string().trim().max(30).optional(),
    department: z.string().trim().max(100).optional(),
    designation: z.string().trim().max(100).optional(),
  }),
})
