import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AdminPagination({ pagination, page, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null

  const firstItem = ((pagination.current_page - 1) * pagination.per_page) + 1
  const lastItem = Math.min(pagination.current_page * pagination.per_page, pagination.total)

  return (
    <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-500">
        Showing {firstItem}-{lastItem} of {pagination.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="min-w-24 text-center text-sm text-stone-500">
          Page {pagination.current_page} of {pagination.last_page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pagination.last_page}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
