import { db } from '@/repositories/drizzle/get-drizzle'
import { users } from '@/repositories/drizzle/schema'
import { z } from 'zod'
import { UserInsert, insertUserSchema, selectUserSchema } from './user-schema'

const argsSchema = z.object({
  data: insertUserSchema,
})

export async function createUserRepo(args: { data: UserInsert }) {
  const { data } = argsSchema.parse(args)

  const [result] = await db
    .insert(users)
    .values(data)
    .returning()

  return selectUserSchema.parse(result)
}
