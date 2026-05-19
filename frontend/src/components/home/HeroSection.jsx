import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Utensils, Hotel, Coffee, Palette, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const categories = [
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'cafes', label: 'Cafés', icon: Coffee },
  { id: 'arts-culture', label: 'Culture', icon: Palette },
  { id: 'activities', label: 'Activities', icon: Compass },
]

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Menara.webp')" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/60" />

      <motion.div
        className="absolute top-1/4 right-[10%] h-32 w-32 rounded-full bg-primary-500/20 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 left-[5%] h-24 w-24 rounded-full bg-amber-500/20 blur-2xl"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight text-balance"
        >
          Discover the Soul of{' '}
          <span className="text-primary-400">Marrakech</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-stone-200"
        >
          Explore Red City like never before — curated places, honest reviews, and intelligent
          recommendations for your perfect trip.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className={`mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search restaurants, riads, experiences..."
              className="h-14 pl-12 rounded-2xl border-0 bg-white/95 text-stone-900 shadow-xl text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 rounded-2xl shadow-xl">
            Search <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          <span className="text-sm text-stone-200 mr-2 self-center">Popular:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/explore?category=${cat.id}`)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <Button variant="luxury" size="lg" asChild>
            <Link to="/explore">Start Exploring</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            asChild
          >
            <Link to="/register">Create Free Account</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
