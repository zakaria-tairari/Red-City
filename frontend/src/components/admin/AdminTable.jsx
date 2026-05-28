import { cn } from '@/lib/utils'

export function AdminTable({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-stone-200 bg-white', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  )
}

export function AdminTableHead({ children }) {
  return (
    <thead className="border-b border-stone-100 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-stone-500">
      {children}
    </thead>
  )
}

export function AdminTableBody({ children }) {
  return <tbody className="divide-y divide-stone-100">{children}</tbody>
}

export function AdminTableRow({ children, className }) {
  return <tr className={cn('hover:bg-stone-50/50', className)}>{children}</tr>
}

export function AdminTableCell({ children, className, header = false }) {
  const Tag = header ? 'th' : 'td'
  return (
    <Tag className={cn('px-4 py-3', header && 'px-4 py-3', className)}>
      {children}
    </Tag>
  )
}
