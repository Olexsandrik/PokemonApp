import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pokemon } from '../api/types'

interface FavoritesState {
  favorites: Pokemon[]
  addFavorite: (pokemon: Pokemon) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist( // auto saving in local storage by this "pokemon-favorites" name
    (set, get) => ({
      favorites: [],
      addFavorite: (pokemon) =>
        set((state) => {
          if (state.favorites.some((p) => p.id === pokemon.id)) {
            return state
          }
          return { favorites: [...state.favorites, pokemon] }
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((p) => p.id !== id),
        })),
      isFavorite: (id) => get().favorites.some((p) => p.id === id),
    }),
    {
      name: 'pokemon-favorites',
    }
  )
)