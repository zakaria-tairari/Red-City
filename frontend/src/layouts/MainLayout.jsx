import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useUIStore } from '../store/useUIStore'

export default function MainLayout() {
  const { exploreViewMode } = useUIStore();
  const location = useLocation();
  const isExplorePage = location.pathname === '/explore'

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      {
        isExplorePage && exploreViewMode === 'map' || <Footer />               
      }
    </>
  )
}
