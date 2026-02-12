import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { getSupportedTokensQueryKey } from '@/use-cases/swap/get-supported-tokens/get-supported-tokens-query-key'
import { getSupportedTokensAction } from '@/use-cases/swap/get-supported-tokens/get-supported-tokens-action'
import { SwapWidgetClient } from './swap-widget-client'
import { SwapWidgetSkeleton } from './swap-widget-skeleton'
import { SwapWidgetError } from './swap-widget-error'

export async function SwapWidgetServer() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: getSupportedTokensQueryKey(),
    queryFn: () => getSupportedTokensAction(),
  })

  return (
    <ErrorBoundary fallback={<SwapWidgetError />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SwapWidgetSkeleton />}>
          <SwapWidgetClient />
        </Suspense>
      </HydrationBoundary>
    </ErrorBoundary>
  )
}
