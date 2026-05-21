import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Utensils, Hotel, Coffee, Palette, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const categories = [
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'cafes', label: 'Cafés', icon: Coffee },
  { id: 'arts-culture', label: 'Culture', icon: Palette },
  { id: 'activities', label: 'Activities', icon: Compass },
]

const BACKGROUND_URL = "/Home.mp4"

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="flex items-center justify-center bg-white">
      <div className=" mx-auto max-w-3xl text-center px-4 mt-35 sm:px-6 lg:px-8 w-full">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-800 max-w-4xl leading-tight text-balance"
        >
          Discover the Soul of{' '}
          <span className="text-primary-500">Marrakech</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-10 text-lg text-stone-500"
        >
          Explore Red City like never before — curated places, honest reviews, and intelligent
          recommendations for your perfect trip.
        </motion.p>

        <form
          onSubmit={handleSearch}
          className="mt-10 flex mx-auto max-w-2xl flex-col gap-3 sm:flex-row transition-all duration-300"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants, hotels, activities..."
              className="h-14 pl-12 rounded-2xl bg-white/95 text-stone-900 shadow-md text-base"
            />
          </div>
        </form>

        <div className="mt-12 flex flex-wrap gap-4 items-center justify-center">
          <Button size="lg" asChild>
            <Link to="/explore">Start Exploring</Link>
          </Button>
          <Button
            variant="luxury"
            size="lg"
            asChild
          >
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
