import { db } from '@/repositories/drizzle/get-drizzle'
import { users } from '@/repositories/drizzle/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { selectUserSchema } from './user-schema'

const argsSchema = z.object({
  email: z.string().email(),
})

type Args = z.infer<typeof argsSchema>

export async function getUserByEmailRepo(args: Args) {
  const { email } = argsSchema.parse(args)

  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))

  if (!result) return null

  return selectUserSchema.parse(result)
}
