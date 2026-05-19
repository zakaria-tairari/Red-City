import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      collections: [{ id: 'default', name: 'My Favorites', placeIds: [] }],

      toggleFavorite: (placeId) => {
        const { favorites, collections } = get()
        const isFav = favorites.includes(placeId)
        const newFavorites = isFav
          ? favorites.filter((id) => id !== placeId)
          : [...favorites, placeId]
        const newCollections = collections.map((c) =>
          c.id === 'default'
            ? {
                ...c,
                placeIds: isFav
                  ? c.placeIds.filter((id) => id !== placeId)
                  : [...c.placeIds, placeId],
              }
            : c
        )
        set({ favorites: newFavorites, collections: newCollections })
      },

      isFavorite: (placeId) => get().favorites.includes(placeId),

      removeFavorite: (placeId) => {
        get().toggleFavorite(placeId)
      },

      addCollection: (name) => {
        const id = `col-${Date.now()}`
        set((state) => ({
          collections: [...state.collections, { id, name, placeIds: [] }],
        }))
        return id
      },
    }),
    { name: 'red-city-favorites' }
  )
)
