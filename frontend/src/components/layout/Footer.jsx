import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CATEGORIES } from '@/data/categories'
import { useUIStore } from '@/store/useUIStore'
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/services/categories'

const quickLinks = [
  { label: 'common.home', to: '/'},
  { label: 'common.exploreLink', to: '/explore' },
  { label: 'auth.login', to: '/login' },
  { label: 'auth.register', to: '/register' },
  { label: 'My favorites', to: '/dashboard/favorites' },
]

const socialLinks = [
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaXTwitter, href: '#', label: 'Twitter' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const { t } = useTranslation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-white">
                Red <span className="text-primary-400">City</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              {t("footer.text")}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-all hover:bg-primary-600 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
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
                    {t(link.label)}
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
              {categories?.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/explore?category=${cat.id}`}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t(`categories.${cat.code}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-stone-400">
              {t("footer.newsLetter")}
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.target.querySelector('input')
                const email = input?.value
                if (email) {
                  useUIStore.getState().addNotification({
                    type: 'success',
                    title: 'Subscription Successful!',
                    message: `You've successfully subscribed as ${email}. Welcome to Red City!`,
                  })
                  if (input) input.value = ''
                }
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
          <p>Made with love in Marrakech</p>
        </div>
      </div>
    </footer>
  )
}
