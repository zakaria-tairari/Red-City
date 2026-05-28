import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar, { getAdminPageTitle } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = getAdminPageTitle(pathname)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-stone-100">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-stone-900/50 lg:hidden"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-stone-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AdminSidebar onNavigate={closeSidebar} onCloseMobile={closeSidebar} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-stone-200 bg-white px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold text-stone-900">
              {pageTitle}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
