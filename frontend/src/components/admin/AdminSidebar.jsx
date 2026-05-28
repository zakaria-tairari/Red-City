import { Link, NavLink } from 'react-router-dom'
import {
  ArrowLeft,
  FolderTree,
  Image,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'

export const adminNavItems = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/places', label: 'Places', icon: MapPin },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/media', label: 'Media', icon: Image },
]

export function getAdminPageTitle(pathname) {
  if (pathname === '/admin') return 'Overview'
  if (pathname.startsWith('/admin/places/') && pathname.endsWith('/edit')) return 'Edit place'
  if (pathname === '/admin/places') return 'Places'
  if (pathname === '/admin/categories') return 'Categories'
  if (pathname === '/admin/reviews') return 'Reviews'
  if (pathname === '/admin/users') return 'Users'
  if (pathname === '/admin/media') return 'Media'
  return 'Admin'
}

export default function AdminSidebar({ onNavigate, onCloseMobile }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-13 items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/admin"
            className="truncate font-display text-lg font-bold tracking-tight text-stone-900"
            onClick={onNavigate}
          >
            Red <span className="text-primary-600">City</span> — Admin
          </Link>
        </div>
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 mt-3" aria-label="Admin navigation">
        {adminNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to site
        </Link>
      </div>
    </div>
  )
}
