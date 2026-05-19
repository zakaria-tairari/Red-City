import { Link, NavLink, Outlet } from 'react-router-dom'
import { Heart, Home, LayoutDashboard, Star } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { to: '/dashboard/reviews', label: 'My Reviews', icon: Star },
]

export default function DashboardLayout() {
  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-stone-900">
              Your dashboard
            </h1>
            <p className="mt-1 text-stone-500">Manage your Marrakech journey</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <nav className="space-y-1 rounded-2xl border border-stone-100 bg-white p-2">
                {sidebarLinks.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-stone-600 hover:bg-stone-50'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
                <Button variant="ghost" className="w-full justify-start text-stone-600" asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" /> Back to home
                  </Link>
                </Button>
              </nav>
            </aside>
            <main className="lg:col-span-3">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
