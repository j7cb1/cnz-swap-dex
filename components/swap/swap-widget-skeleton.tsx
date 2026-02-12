import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SwapWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From token row */}
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </div>

        {/* Direction toggle */}
        <div className="flex justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* To token row */}
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </div>

        {/* Swap button */}
        <Skeleton className="h-11 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}
