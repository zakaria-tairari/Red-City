import { create } from 'zustand'
import { useUIStore } from './useUIStore'
import * as favoritesService from '@/services/favorites'

export const useFavoritesStore = create((set, get) => ({
  favorites: [], // Array of place IDs
  favoritePlaces: [], // Array of detailed place objects
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true })
    try {
      const response = await favoritesService.getFavorites()
      if (response.success) {
        const places = response.data
        const placeIds = places.map(p => p.id)
        set({ favorites: placeIds, favoritePlaces: places, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (place) => {
    const { favorites, favoritePlaces } = get()
    const isFav = favorites.includes(place.id)
    
    // Optimistic update
    const newFavorites = isFav
      ? favorites.filter((id) => id !== place.id)
      : [...favorites, place.id]
      
    const newFavoritePlaces = isFav
      ? favoritePlaces.filter((p) => p.id !== place.id)
      : [...favoritePlaces, place]

    set({ favorites: newFavorites, favoritePlaces: newFavoritePlaces })

    // Visual feedback
    useUIStore.getState().addNotification({
      type: isFav ? 'info' : 'success',
      title: isFav ? 'Removed from Favorites' : 'Saved to Favorites',
      message: isFav 
        ? `Removed "${place.name}" from your favorites.`
        : `Saved "${place.name}" to your favorites!`,
    })

    try {
      // Backend sync
      await favoritesService.toggleFavorite(place.id)
    } catch {
      // Revert on error
      set({ favorites, favoritePlaces })
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update favorites on the server.',
      })
    }
  },

  isFavorite: (placeId) => get().favorites.includes(placeId),

  removeFavorite: async (placeId) => {
    const place = get().favoritePlaces.find(p => p.id === placeId) || { id: placeId, name: 'Place' }
    await get().toggleFavorite(place)
  },
}))
