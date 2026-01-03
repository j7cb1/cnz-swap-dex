import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { users } from '@/repositories/drizzle/schema'
import { z } from 'zod'

export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)

export const updateUserSchema = insertUserSchema
  .omit({ id: true })
  .partial()

// User without sensitive fields (passwordHash)
export const safeUserSchema = selectUserSchema.omit({ passwordHash: true })

export type User = z.infer<typeof selectUserSchema>
export type SafeUser = z.infer<typeof safeUserSchema>
export type UserInsert = z.infer<typeof insertUserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>
