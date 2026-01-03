import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { getQueryClient } from '@/lib/query-client'
import { getUserByEmailRepo } from '@/repositories/users/get-user-by-email-repo'
import { selectUserSchema } from '@/repositories/users/user-schema'
import { getUserByEmailQueryKey } from './get-user-by-email-query-key'
import { captureError } from '@/utilities/error'

export const GetUserByEmailUseCaseArgsSchema = z.object({
  email: z.string().email(),
  log: z.custom<Logger | undefined>(),
})

export const GetUserByEmailUseCaseResultSchema = createResultSchema(
  selectUserSchema.nullable(),
  z.object({ message: z.string() }).passthrough()
)

export type GetUserByEmailUseCaseArgs = z.infer<typeof GetUserByEmailUseCaseArgsSchema>
export type GetUserByEmailUseCaseResult = ZodFunctionResult<typeof GetUserByEmailUseCaseResultSchema>

export async function getUserByEmailUseCase({
  email,
  log,
}: GetUserByEmailUseCaseArgs): Promise<GetUserByEmailUseCaseResult> {
  const { success, error } = GetUserByEmailUseCaseResultSchema

  try {
    log?.info({ email }, 'Get user by email')

    const queryClient = getQueryClient()
    const queryKey = getUserByEmailQueryKey(email)

    const user = await queryClient.fetchQuery({
      queryKey,
      queryFn: () => getUserByEmailRepo({ email }),
    })

    log?.info({ email }, 'Retrieved user')
    return success(user)
  } catch (err) {
    log?.error({ err, email }, 'Error fetching user by email')
    captureError(err)
    return error({ message: 'Failed to fetch user' })
  }
}
