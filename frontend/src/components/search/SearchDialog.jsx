import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Clock, ArrowRight, Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/store/useSearchStore'
import { fetchSearchResults } from '@/services/places'
import { useDebounce } from '@/hooks/useDebounce'

// ─── Recent searches (localStorage) ───────────────────────────────────────────
const STORAGE_KEY = 'search:recent'
const MAX_RECENT = 6

function getRecent() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(place) {
  const prev = getRecent().filter((p) => p.id !== place.id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([place, ...prev].slice(0, MAX_RECENT)))
}
function clearRecent() {
  localStorage.removeItem(STORAGE_KEY)
}

export function SearchDialog() {
  const { open, setOpen } = useSearchStore()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState([])
  const [active, setActive] = useState(-1)

  const debouncedQuery = useDebounce(query)

  const { data: places, isLoading } = useQuery({
    queryKey: ['search-places', debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: !!debouncedQuery.trim(),
  })

  const results = places ?? []
  const list = query.trim() ? results : recent

  useEffect(() => {
    return useSearchStore.getState().init()
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setRecent(getRecent())
      setQuery('')
      setActive(-1)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setActive(-1) }, [query])

  const handleClose = useCallback(() => setOpen(false), [setOpen])

  const handleSelect = useCallback((place) => {
    saveRecent({ id: place.id, name: place.name, area: place.area, cover: place.cover })
    setRecent(getRecent())
    handleClose()
    navigate(`/places/${place.id}`)
  }, [navigate, handleClose])

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return
    handleClose()
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }, [query, navigate, handleClose])

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { handleClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, list.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)) }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (active >= 0 && list[active]) handleSelect(list[active])
        else handleSubmit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, active, list, handleSelect, handleSubmit, handleClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[10vh] z-50 w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-stone-900/8">

              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100">
                {isLoading
                  ? <Loader2 className="h-5 w-5 shrink-0 text-stone-400 animate-spin" />
                  : <Search className="h-5 w-5 shrink-0 text-stone-400" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search places…"
                  className="flex-1 bg-transparent text-base text-stone-900 placeholder:text-stone-400 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); inputRef.current?.focus() }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Results / Recent */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {list.length > 0 && (
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-xs font-medium tracking-wide text-stone-400 uppercase">
                      {query.trim() ? 'Results' : 'Recent'}
                    </span>
                    {!query.trim() && recent.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { clearRecent(); setRecent([]) }}
                        className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                <ul className="px-2 py-2">
                  {list.map((place, i) => {
                    return (
                      <li key={place.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(place)}
                          onMouseEnter={() => setActive(i)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                            active === i ? 'bg-stone-100' : 'hover:bg-stone-50'
                          )}
                        >
                          <div className="h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                            {place.cover
                              ? <img src={place.cover.app_url || place.cover.original_url} alt="" className="h-full w-full object-cover" />
                              : <div className="flex h-full w-full items-center justify-center">
                                  <MapPin className="h-4 w-4 text-stone-300" />
                                </div>
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-xl font-serif font-semibold text-stone-900">
                              {place.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-stone-700">4.5</span>
                              <span>1.2k</span>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                              <MapPin className="h-3 w-3" />
                              {place.area}
                            </p>
                            
                          </div>
                          {query.trim()
                            ? <ArrowRight className="h-4 w-4 shrink-0 text-stone-300" />
                            : <Clock className="h-3.5 w-3.5 shrink-0 text-stone-300" />
                          }
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {query.trim() && !isLoading && results.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Search className="h-8 w-8 text-stone-200" />
                    <p className="text-sm font-medium text-stone-500">No results for "{query}"</p>
                    <p className="text-xs text-stone-400">Press Enter to search in Explore</p>
                  </div>
                )}

                {!query.trim() && recent.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Search className="h-8 w-8 text-stone-200" />
                    <p className="text-sm text-stone-400">Search for places, restaurants, and more</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 border-t border-stone-100 px-4 py-2.5">
                <kbd className="inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-500">↑↓</kbd>
                <span className="text-xs text-stone-400">navigate</span>
                <kbd className="inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-500">↵</kbd>
                <span className="text-xs text-stone-400">search</span>
                <kbd className="ml-auto inline-flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-500">esc</kbd>
                <span className="text-xs text-stone-400">close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}