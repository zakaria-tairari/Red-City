import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Dialog({ ...props }) {
  return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger {...props} />
}

export function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal {...props} />
}

export function DialogClose({ ...props }) {
  return <DialogPrimitive.Close {...props} />
}

export function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out',
        className
      )}
      {...props}
    />
  )
}

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-stone-100 bg-white p-6 shadow-xl duration-200 rounded-2xl max-h-[90vh] overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-stone-100 transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('font-serif text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}
