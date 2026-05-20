import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ToastContainer from '@/components/layout/ToastContainer'

export default function MainLayout() {
  return (
    <>
      <ToastContainer />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

