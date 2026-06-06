import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ToastContainer from '@/components/layout/ToastContainer'
import { useAuthStore } from '@/store/useAuthStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useSearchStore } from '@/store/useSearchStore'
import { Skeleton } from '@/components/ui/Skeleton'

const Home = lazy(() => import('@/pages/Home'))
const Explore = lazy(() => import('@/pages/Explore'))
const Chat = lazy(() => import('@/pages/Chat'))
const PlaceDetails = lazy(() => import('@/pages/PlaceDetails'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'))
const DashboardOutlet = lazy(() => import('@/layouts/DashboardOutlet'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const DashboardReviews = lazy(() => import('@/pages/DashboardReviews'))
const DashboardProfile = lazy(() => import('@/pages/DashboardProfile'))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'))
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'))
const AdminPlaces = lazy(() => import('@/pages/admin/AdminPlaces'))
const AdminPlaceEdit = lazy(() => import('@/pages/admin/AdminPlaceEdit'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'))
const SearchDialog = lazy(() =>
  import('@/components/search/SearchDialog').then((module) => ({ default: module.SearchDialog }))
)

function PageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-6 h-72 w-full rounded-2xl" />
    </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuthStore()
  if (isLoading || !hasCheckedAuth) return <PageFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuthStore()
  if (isLoading || !hasCheckedAuth) return <PageFallback />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading, hasCheckedAuth } = useAuthStore()
  if (isLoading || !hasCheckedAuth) return <PageFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { checkAuth, isAuthenticated } = useAuthStore()
  const { fetchFavorites } = useFavoritesStore()
  const searchOpen = useSearchStore((state) => state.open)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => useSearchStore.getState().init(), [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated, fetchFavorites])

  return (
    <>
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchDialog />
        </Suspense>
      )}
      <ToastContainer />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="chat" element={<Chat />} />
            <Route path="places/:id" element={<PlaceDetails />} />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardOutlet />
              </ProtectedRoute>
            }>
              <Route index element={<Favorites />} />
              <Route path="reviews" element={<DashboardReviews />} />
              <Route path="profile" element={<DashboardProfile />} />
            </Route>
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="places" element={<AdminPlaces />} />
            <Route path="places/:id/edit" element={<AdminPlaceEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="media" element={<AdminMedia />} />
          </Route>

          <Route path="/" element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="verify-email" element={<VerifyEmail />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
