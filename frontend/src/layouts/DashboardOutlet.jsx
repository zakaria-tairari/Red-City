import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, Heart, LayoutGrid, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { to: '/dashboard/reviews', label: 'My Reviews', icon: Star },
]

export default function DashboardOutlet() {
  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">
              Your dashboard
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Manage your Marrakech journey
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back to home
          </Link>
        </div>

        <nav
          className="mb-5 flex flex-wrap gap-2"
          aria-label="Dashboard sections"
        >
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 font-semibold transition-all',
                  isActive
                    ? 'text-primary-600'
                    : 'text-stone-600 hover:text-primary-700'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
