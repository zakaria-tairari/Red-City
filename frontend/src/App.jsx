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
import DashboardProfile from '@/pages/DashboardProfile'
import { SearchDialog } from '@/components/search/SearchDialog'
import ToastContainer from '@/components/layout/ToastContainer'
import { useAuthStore } from '@/store/useAuthStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { checkAuth, isAuthenticated } = useAuthStore()
  const { fetchFavorites } = useFavoritesStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated, fetchFavorites])

  return (
    <>
      <SearchDialog />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="places/:id" element={<PlaceDetails />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardOutlet />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="reviews" element={<DashboardReviews />} />
            <Route path="profile" element={<DashboardProfile />} />
          </Route>
        </Route>

        <Route path="/" element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="verify-email" element={<VerifyEmail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
