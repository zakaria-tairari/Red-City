import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  color = 'text-primary-600',
  description,
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex min-h-28 items-center gap-4 p-5">
        <div className={cn('rounded-lg bg-stone-50 p-3', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          <p className="text-sm text-stone-500">{label}</p>
          {description && (
            <p className="mt-1 truncate text-xs font-medium text-stone-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
