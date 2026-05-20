import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useUIStore } from './useUIStore'
import { MOCK_PLACES } from '@/data/mockPlaces'

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
        
        // Dynamic visual feedback using Toast Container
        const placeName = MOCK_PLACES.find((p) => p.id === placeId)?.name || 'Place'
        useUIStore.getState().addNotification({
          type: isFav ? 'info' : 'success',
          title: isFav ? 'Removed from Favorites' : 'Saved to Favorites',
          message: isFav 
            ? `Removed "${placeName}" from your favorites.`
            : `Saved "${placeName}" to your favorites collection!`,
        })

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

        // Notification feedback
        useUIStore.getState().addNotification({
          type: 'success',
          title: 'Collection Created',
          message: `Successfully created custom collection "${name}"!`,
        })

        return id
      },
    }),
    { name: 'red-city-favorites' }
  )
)

