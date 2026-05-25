import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { cn } from '@/lib/utils'

function useScrollState(ref, deps = []) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((child) => ro.observe(child))
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, ...deps])

  return { canScrollLeft, canScrollRight }
}

export default function PlacesRow({ places = [], title, viewAllHref, viewAllLabel = 'View all' }) {
  const scrollRef = useRef(null)
  const { canScrollLeft, canScrollRight } = useScrollState(scrollRef, [places])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector('[data-card]')?.offsetWidth ?? 288
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' })
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between gap-4 mb-8">
          {title && (
            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
              {title}
            </h2>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-all duration-150',
                canScrollLeft ? 'hover:bg-stone-100 active:scale-95' : 'cursor-default opacity-30'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-all duration-150',
                canScrollRight ? 'hover:bg-stone-100 active:scale-95' : 'cursor-default opacity-30'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {viewAllHref && (
              <Link
                to={viewAllHref}
                className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 ml-2"
              >
                {viewAllLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {places.map((place, i) => (
            <motion.div
              key={place.id}
              data-card
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <PlaceCard place={place} variant="horizontal" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}