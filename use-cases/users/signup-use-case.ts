import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { createUserUseCase } from './create-user-use-case'
import { getUserByEmailUseCase } from './get-user-by-email-use-case'
import { captureError } from '@/utilities/error'

export const SignupUseCaseArgsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  log: z.custom<Logger | undefined>(),
})

export const SignupUseCaseResultSchema = createResultSchema(
  z.object({ success: z.boolean() }),
  z.object({ message: z.string() }).passthrough()
)

export type SignupUseCaseArgs = z.infer<typeof SignupUseCaseArgsSchema>
export type SignupUseCaseResult = ZodFunctionResult<typeof SignupUseCaseResultSchema>

export async function signupUseCase({
  email,
  password,
  name,
  log,
}: SignupUseCaseArgs): Promise<SignupUseCaseResult> {
  const { success, error } = SignupUseCaseResultSchema

  try {
    log?.info({ email }, 'Processing signup')

    // Check if email is already taken
    const existingUserResult = await getUserByEmailUseCase({ email, log })
    if (existingUserResult.error) {
      return error({ message: 'Failed to validate email' })
    }
    if (existingUserResult.data) {
      return error({ message: 'An account with this email already exists' })
    }

    // Create user as member by default
    const userResult = await createUserUseCase({
      data: {
        email,
        password,
        name,
        role: 'member',
      },
      log,
    })

    if (userResult.error) {
      return error({ message: userResult.error.message })
    }

    log?.info({ userId: userResult.data.id }, 'User signup completed')

    return success({ success: true })
  } catch (err) {
    log?.error({ err, email }, 'Error during signup')
    captureError(err)
    return error({ message: 'Signup failed' })
  }
}
