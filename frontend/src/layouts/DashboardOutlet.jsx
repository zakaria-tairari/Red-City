import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, Heart, LayoutGrid, Star, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function DashboardOutlet() {
  const { t } = useTranslation()

  const tabs = [
    { to: '/dashboard', labelKey: 'dashboard.overview', icon: LayoutGrid, end: true },
    { to: '/dashboard/favorites', labelKey: 'dashboard.favorites', icon: Heart },
    { to: '/dashboard/reviews', labelKey: 'dashboard.myReviews', icon: Star },
    { to: '/dashboard/profile', labelKey: 'dashboard.profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">
              {t('dashboard.title')}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{t('dashboard.subtitle')}</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {t('common.backToHome')}
          </Link>
        </div>

        <nav
          className="mb-5 flex flex-wrap gap-2"
          aria-label="Dashboard sections"
        >
          {tabs.map(({ to, labelKey, icon: Icon, end }) => (
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
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
