import bcrypt from 'bcrypt'
import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { getUserByEmailUseCase } from '@/use-cases/users/get-user-by-email-use-case'
import { getResellerByIdUseCase } from '@/use-cases/resellers/get-reseller-by-id-use-case'
import { safeUserSchema } from '@/repositories/users/user-schema'
import { captureError } from '@/utilities/error'

export const ValidateCredentialsUseCaseArgsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  log: z.custom<Logger | undefined>(),
})

export const ValidateCredentialsUseCaseResultSchema = createResultSchema(
  safeUserSchema,
  z.object({ message: z.string() }).passthrough()
)

export type ValidateCredentialsUseCaseArgs = z.infer<typeof ValidateCredentialsUseCaseArgsSchema>
export type ValidateCredentialsUseCaseResult = ZodFunctionResult<typeof ValidateCredentialsUseCaseResultSchema>

export async function validateCredentialsUseCase({
  email,
  password,
  log,
}: ValidateCredentialsUseCaseArgs): Promise<ValidateCredentialsUseCaseResult> {
  const { success, error } = ValidateCredentialsUseCaseResultSchema

  try {
    log?.info({ email }, 'Validating credentials')

    const userResult = await getUserByEmailUseCase({ email, log })

    if (userResult.error) {
      return error({ message: 'Invalid credentials' })
    }

    const user = userResult.data

    if (!user || !user.passwordHash) {
      log?.info({ email }, 'User not found or no password')
      return error({ message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      log?.info({ email }, 'Invalid password')
      return error({ message: 'Invalid credentials' })
    }

    // Check if user's reseller is soft-deleted
    if (user.resellerId) {
      const resellerResult = await getResellerByIdUseCase({ resellerId: user.resellerId, log })
      if (resellerResult.error || !resellerResult.data) {
        log?.info({ email, resellerId: user.resellerId }, 'User reseller is deleted')
        return error({ message: 'Your organization has been deactivated' })
      }
    }

    log?.info({ email, userId: user.id }, 'Credentials valid')

    return success({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      resellerId: user.resellerId,
    })
  } catch (err) {
    log?.error({ err, email }, 'Error validating credentials')
    captureError(err)
    return error({ message: 'Authentication failed' })
  }
}
