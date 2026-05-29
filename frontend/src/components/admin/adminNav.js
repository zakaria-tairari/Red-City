import {
  Database,
  FolderTree,
  Image,
  LayoutDashboard,
  MessageSquare,
  Users,
} from 'lucide-react'

export const adminNavItems = [
  { to: '/admin', label: 'Analytics', icon: LayoutDashboard, end: true },
  { to: '/admin/places', label: 'Data quality', icon: Database },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/media', label: 'Media pipeline', icon: Image },
]

export function getAdminPageTitle(pathname) {
  if (pathname === '/admin') return 'Analytics'
  if (pathname.startsWith('/admin/places/') && pathname.endsWith('/edit')) return 'Place correction'
  if (pathname === '/admin/places') return 'Data quality'
  if (pathname === '/admin/categories') return 'Categories'
  if (pathname === '/admin/reviews') return 'Reviews'
  if (pathname === '/admin/users') return 'Users'
  if (pathname === '/admin/media') return 'Media pipeline'
  return 'Admin'
}
