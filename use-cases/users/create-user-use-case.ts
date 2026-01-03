import bcrypt from 'bcrypt'
import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { createUserRepo } from '@/repositories/users/create-user-repo'
import { safeUserSchema } from '@/repositories/users/user-schema'
import { captureError } from '@/utilities/error'
import { ROLES } from '@/utilities/roles'

export const CreateUserUseCaseArgsSchema = z.object({
  data: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    role: z.enum(ROLES),
  }),
  log: z.custom<Logger | undefined>(),
})

export const CreateUserUseCaseResultSchema = createResultSchema(
  safeUserSchema,
  z.object({ message: z.string() }).passthrough()
)

export type CreateUserUseCaseArgs = z.infer<typeof CreateUserUseCaseArgsSchema>
export type CreateUserUseCaseResult = ZodFunctionResult<typeof CreateUserUseCaseResultSchema>

export async function createUserUseCase({
  data,
  log,
}: CreateUserUseCaseArgs): Promise<CreateUserUseCaseResult> {
  const { success, error } = CreateUserUseCaseResultSchema

  try {
    log?.info({ email: data.email }, 'Create user')

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    const result = await createUserRepo({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      },
    })

    log?.info({ userId: result.id, email: result.email }, 'Created user')

    // Return safe user (without passwordHash)
    return success({
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      deletedAt: result.deletedAt,
    })
  } catch (err) {
    log?.error({ err, email: data.email }, 'Error creating user')
    captureError(err)

    // Check for unique constraint violation
    if (err instanceof Error && err.message.includes('unique')) {
      return error({ message: 'Email already exists' })
    }

    return error({ message: 'Failed to create user' })
  }
}
