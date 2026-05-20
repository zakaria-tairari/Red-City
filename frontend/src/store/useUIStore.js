import { create } from 'zustand'

export const useUIStore = create((set) => ({
  exploreViewMode: 'grid',
  setExploreViewMode: (mode) => set({ exploreViewMode: mode }),
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), ...notification },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
