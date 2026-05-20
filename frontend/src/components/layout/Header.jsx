import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Heart, Menu, Search, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Explore', to: '/explore' },
  { name: 'Restaurants', to: '/explore?category=restaurants' },
  { name: 'Hotels', to: '/explore?category=hotels' },
  { name: 'Activities', to: '/explore?category=activities' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-stone-100/80 bg-white/90 backdrop-blur-md">
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
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary-700' : 'text-stone-600 hover:text-primary-600'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={() => navigate('/explore')} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/favorites" aria-label="Favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <User className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
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
                  {link.name}
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
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/dashboard/favorites" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
