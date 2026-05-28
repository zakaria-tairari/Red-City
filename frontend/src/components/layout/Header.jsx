import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Heart, Menu, Search, Shield, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"
import { useSearchStore } from '../../store/useSearchStore'
import { useAuthStore } from '@/store/useAuthStore'

const navLinks = [
  { name: 'common.home', to: '/'},
  { name: 'common.exploreLink', to: '/explore' },
  { name: 'categories.restaurants', to: '/explore?category=2' },
  { name: 'categories.hotelsShort', to: '/explore?category=7' },
  { name: 'categories.activites', to: '/explore?category=3' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation();
  const location = useLocation();
  const { toggle } = useSearchStore()
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore()
  const userIsAdmin = isAdmin()

  const isLinkActive = (to) => location.pathname + location.search === to

  return (
    <header className="fixed top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Red <span className="text-primary-600">City</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isLinkActive(link.to) ? 'text-primary-700' : 'text-stone-600 hover:text-primary-600'
                )
              }
            >
              {t(link.name)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={() => toggle()} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/favorites" aria-label="Favorites">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              {userIsAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/admin" className="flex items-center gap-2 text-primary-700">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.first_name || 'Dashboard'}</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/login">{t("auth.login")}</Link>
            </Button>
          )}
          <LanguageSwitcher />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-stone-100 bg-white md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 hover:bg-stone-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.name)}
                </Link>
              ))}
              <Link
                to="/explore"
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-stone-700 hover:bg-stone-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-5 w-5" /> Search places
              </Link>
              <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4">
                {isAuthenticated ? (
                  <>
                    {userIsAdmin && (
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/dashboard/favorites" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { logout(); setIsMenuOpen(false) }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Se connecter</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>S'inscrire</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
