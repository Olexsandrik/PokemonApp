import { create } from 'zustand'
import type { Pokemon } from '../api/types'

interface PokemonStore {
  pokemonItem: Pokemon | null
  setPokemonItem: (pokemon: Pokemon | null) => void
  pokemons: Pokemon[]
  setPokemons: (pokemons: Pokemon[]) => void
  removedPokemonFromList: (pokemon: Pokemon) => void
  currentLogInfo: () => void
}

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  pokemonItem: null,
  setPokemonItem: (pokemon) => set({ pokemonItem: pokemon }),

  pokemons: [],
  setPokemons: (pokemons) => set({ pokemons }),

  removedPokemonFromList: (pokemon) =>
    set((state) => ({
      pokemons: state.pokemons.filter((poke) => poke.id !== pokemon.id),
    })),

  currentLogInfo: () => {
    const { pokemonItem, pokemons } = get()
    console.log('Selected pokemon:', pokemonItem)
    console.log('Pokemons list:', pokemons)
  },
}))
