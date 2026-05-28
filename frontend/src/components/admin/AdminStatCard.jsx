import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function AdminStatCard({ label, value, icon: Icon, color = 'text-primary-600' }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('rounded-xl bg-stone-50 p-3', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          <p className="text-sm text-stone-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
