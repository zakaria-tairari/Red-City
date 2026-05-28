import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Play, Grid2X2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PREVIEW_COUNT = 5

function VideoThumb({ url }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-stone-800">
      <video src={url} className="h-full w-full object-cover opacity-80" muted playsInline />
      <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-12 w-12 text-white translate-x-0.5" />
      </div>
    </div>
  )
}

function GridPreview({ media, onOpenGallery }) {
  const preview = media.slice(0, PREVIEW_COUNT)
  const remainder = media.length - PREVIEW_COUNT

  const count = preview.length

  const gridClass = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-3 grid-rows-1',
    4: 'grid-cols-2 grid-rows-2',
    5: 'grid-cols-3 grid-rows-2',
    6: 'grid-cols-3 grid-rows-2',
  }[count] ?? 'grid-cols-3 grid-rows-2'

  const getItemStyle = (i) => {
    if (count === 3 && i === 0) return 'row-span-1 col-span-1'
    if (count === 5 && i === 0) return 'row-span-2'
    return ''
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className={cn('grid gap-1', gridClass)} style={{ aspectRatio: count === 1 ? '16/9' : '5/3' }}>
        {preview.map((item, i) => {
          const isLast = i === PREVIEW_COUNT - 1 && remainder > 0
          return (
            <button
              key={item.id ?? i}
              type="button"
              onClick={() => onOpenGallery(i)}
              className={cn(
                'group relative overflow-hidden bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300',
                getItemStyle(i)
              )}
            >
              {item.type === 'video' ? (
                <VideoThumb url={item.url} />
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/5" />
              {isLast && remainder > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
                  <span className="text-3xl font-light text-white">+{remainder}</span>
                  <span className="mt-1 text-xs font-medium tracking-widest text-white/75 uppercase">more</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FullGallery({ media, initialIndex, onClose }) {
  const [active, setActive] = useState(initialIndex)
  const thumbsRef = useRef(null)
  const current = media[active]

  const next = () => setActive((i) => (i + 1) % media.length)
  const prev = () => setActive((i) => (i - 1 + media.length) % media.length)

  // Scroll active thumb into view
  useEffect(() => {
    const container = thumbsRef.current
    if (!container) return
    const thumb = container.children[active]
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [active])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-stone-900"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <span className="text-sm font-medium text-white/50 tabular-nums">
          {active + 1} / {media.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main media area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-16 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="flex max-h-full max-w-full items-center justify-center"
          >
            {current?.type === 'video' ? (
              <video
                key={current.url}
                src={current.url}
                className="max-h-full max-w-full rounded-lg"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
                autoPlay
                controls
                loop
                playsInline
              />
            ) : (
              <img
                src={current?.url}
                alt=""
                className="max-h-full max-w-full rounded-lg object-contain"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 px-4 py-4">
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-2 py-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {media.map((item, i) => (
            <button
              key={item.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-lg transition-all duration-200',
                'h-18 w-25 focus-visible:outline-none',
                i === active
                  ? 'opacity-100 scale-107'
                  : 'opacity-45 hover:opacity-70'
              )}
              style={{ scrollSnapAlign: 'center' }}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-stone-700">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function PlaceGallery({ media = [] }) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  if (!media.length) return null

  const openGallery = (index) => {
    setStartIndex(index)
    setGalleryOpen(true)
  }

  return (
    <>
      <GridPreview media={media} onOpenGallery={openGallery} />

      <AnimatePresence>
        {galleryOpen && (
          <FullGallery
            media={media}
            initialIndex={startIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}