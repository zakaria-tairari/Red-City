import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function AdminEmptyState({ title = 'No records found', message, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center text-stone-500', className)}>
      <Inbox className="h-8 w-8 text-stone-300" />
      <p className="font-medium text-stone-700">{title}</p>
      {message && <p className="max-w-md text-sm">{message}</p>}
    </div>
  )
}

export function AdminErrorState({ title = 'Something went wrong', message, onRetry, className }) {
  return (
    <div className={cn('rounded-xl border border-red-100 bg-red-50 p-6 text-red-900', className)}>
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="space-y-3">
          <div>
            <p className="font-semibold">{title}</p>
            {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
          </div>
          {onRetry && (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
