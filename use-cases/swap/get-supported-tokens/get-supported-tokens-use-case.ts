import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { tokenSchema } from '@/repositories/swap/swap-schema'
import { captureError } from '@/utilities/error'

export const GetSupportedTokensUseCaseArgsSchema = z.object({
  log: z.custom<Logger | undefined>(),
})

export const GetSupportedTokensUseCaseResultSchema = createResultSchema(
  z.array(tokenSchema),
  z.object({ message: z.string() }).passthrough()
)

export type GetSupportedTokensUseCaseArgs = z.infer<typeof GetSupportedTokensUseCaseArgsSchema>
export type GetSupportedTokensUseCaseResult = ZodFunctionResult<typeof GetSupportedTokensUseCaseResultSchema>

export async function getSupportedTokensUseCase({
  log,
}: GetSupportedTokensUseCaseArgs): Promise<GetSupportedTokensUseCaseResult> {
  const { success, error } = GetSupportedTokensUseCaseResultSchema

  try {
    log?.info('Fetching supported tokens from SwapKit API')

    const response = await fetch('https://api.swapkit.dev/tokens', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SWAPKIT_API_KEY ?? '',
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      log?.error({ status: response.status }, 'SwapKit tokens API returned error')
      return error({ message: `Failed to fetch tokens: ${response.statusText}` })
    }

    const data = await response.json()

    const tokens = z.array(tokenSchema).safeParse(data)
    if (!tokens.success) {
      log?.warn('Token response did not match schema exactly, returning raw data')
      return success(Array.isArray(data) ? data : [])
    }

    log?.info({ count: tokens.data.length }, 'Retrieved supported tokens')
    return success(tokens.data)
  } catch (err) {
    log?.error({ err }, 'Error fetching supported tokens')
    captureError(err)
    return error({ message: 'Failed to fetch supported tokens' })
  }
}
