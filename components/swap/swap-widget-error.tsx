'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconAlertTriangle } from '@tabler/icons-react'

type SwapWidgetErrorProps = {
  error?: Error
  reset?: () => void
}

export function SwapWidgetError({ error, reset }: SwapWidgetErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <IconAlertTriangle className="h-10 w-10 text-destructive" />
        <div className="text-center space-y-1">
          <p className="font-medium">Failed to load swap widget</p>
          <p className="text-sm text-muted-foreground">
            {error?.message ?? 'An unexpected error occurred'}
          </p>
        </div>
        {reset && (
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
