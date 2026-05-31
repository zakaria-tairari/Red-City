import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, Heart, LayoutGrid, Star, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function DashboardOutlet() {
  const { t } = useTranslation()

  const tabs = [
    { to: '/dashboard', labelKey: 'dashboard.favorites', icon: Heart, end: true },
    { to: '/dashboard/reviews', labelKey: 'dashboard.myReviews', icon: Star },
    { to: '/dashboard/profile', labelKey: 'dashboard.profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
        <nav
          className="flex flex-wrap gap-12"
          aria-label="Dashboard sections"
        >
          {tabs.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 transition-all text-sm font-semibold',
                  isActive
                    ? 'text-primary-600'
                    : 'text-stone-600 hover:text-primary-700'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
        <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors font-semibold hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {t('common.backToHome')}
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
