import { Link } from 'react-router-dom'
import { Compass, Globe, Mail, MessageCircle, Share2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORIES } from '@/data/categories'

const quickLinks = [
  { label: 'Explore', to: '/explore' },
  { label: 'About Marrakech', to: '/explore?category=arts-culture' },
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/register' },
  { label: 'My favorites', to: '/dashboard/favorites' },
]

const socialLinks = [
  { icon: Share2, href: '#', label: 'Instagram' },
  { icon: Globe, href: '#', label: 'Facebook' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: Video, href: '#', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-white">
                Red <span className="text-primary-400">City</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              Your intelligent guide to Marrakech — discover hidden riads, world-class dining,
              desert adventures, and the soul of the Red City.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-all hover:bg-primary-600 hover:text-white hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Categories
            </h4>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/explore?category=${cat.id}`}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-stone-400">
              Get curated Marrakech tips and exclusive offers.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                required
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-6 flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary-400" />
              hello@redcity.ma
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-8 text-sm text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Red City. All rights reserved.</p>
          <p>Made with love in Marrakech 🇲🇦</p>
        </div>
      </div>
    </footer>
  )
}
