import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, Play, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function PlaceGallery({ images = [], videoUrl }) {
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const allMedia = videoUrl ? [{ type: 'video', url: videoUrl }, ...images.map((u) => ({ type: 'image', url: u }))] : images.map((u) => ({ type: 'image', url: u }))

  const current = allMedia[active] || allMedia[0]

  const next = () => setActive((i) => (i + 1) % allMedia.length)
  const prev = () => setActive((i) => (i - 1 + allMedia.length) % allMedia.length)

  return (
    <>
      <div className="relative aspect-[21/9] min-h-[280px] overflow-hidden rounded-2xl bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {current?.type === 'video' ? (
              <div className="flex h-full items-center justify-center bg-stone-800">
                <Play className="h-16 w-16 text-white/80" />
                <p className="absolute bottom-4 left-4 text-white text-sm">Video preview</p>
              </div>
            ) : (
              <img src={current?.url} alt="" className="h-full w-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {allMedia.length > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
          aria-label="Fullscreen"
        >
          <Expand className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {allMedia.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === active ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-stone-700">
                  <Play className="h-4 w-4 text-white" />
                </div>
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0 overflow-hidden">
          <button type="button" onClick={() => setFullscreen(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          {current?.type === 'image' && (
            <img src={current.url} alt="" className="w-full max-h-[85vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
