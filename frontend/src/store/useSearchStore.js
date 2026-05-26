import { create } from 'zustand'

export const useSearchStore = create((set) => ({
  open: false,
  setOpen: (val) => set({ open: val }),
  toggle: () => set((state) => ({ open: !state.open })),
  init: () => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        set((state) => ({ open: !state.open }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  },
}))