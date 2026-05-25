import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-800',
        secondary: 'border-transparent bg-stone-100 text-stone-700',
        outline: 'border-stone-200 text-stone-600',
        success: 'border-transparent bg-emerald-100 text-emerald-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
