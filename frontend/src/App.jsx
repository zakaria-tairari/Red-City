import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardOutlet from '@/layouts/DashboardOutlet'
import Home from '@/pages/Home'
import Explore from '@/pages/Explore'
import PlaceDetails from '@/pages/PlaceDetails'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import VerifyEmail from '@/pages/VerifyEmail'
import Dashboard from '@/pages/Dashboard'
import Favorites from '@/pages/Favorites'
import DashboardReviews from '@/pages/DashboardReviews'
import { SearchDialog } from '@/components/search/SearchDialog'
import ToastContainer from '@/components/layout/ToastContainer'

export default function App() {
  return (
    <>
      <SearchDialog />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="places/:id" element={<PlaceDetails />} />
          <Route path="dashboard" element={<DashboardOutlet />}>
            <Route index element={<Dashboard />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="reviews" element={<DashboardReviews />} />
          </Route>
        </Route>

        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="verify-email" element={<VerifyEmail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
