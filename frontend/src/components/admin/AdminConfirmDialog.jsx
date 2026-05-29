import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export default function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirming = false,
  destructive = false,
  onOpenChange,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {message && <p className="text-sm leading-6 text-stone-600">{message}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? 'default' : 'default'}
            className={destructive ? 'bg-red-600 hover:bg-red-700' : undefined}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
