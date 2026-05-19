import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Pokemon } from './types'
import { usePokemonStore } from '../store/usePokemonStore';
import { fetchDetails } from './utility/fetchPokemonDetails';


const POKEAPI_BASE = import.meta.env.VITE_API_BASE_URL || 'https://pokeapi.co/api/v2'
const LIMIT = Number(import.meta.env.VITE_POKEMON_LIMIT) || 24

interface UsePokemonsReturn {
  pokemons: Pokemon[]
  loading: boolean
  error: string | null
  page: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: () => void
  prevPage: () => void
}

export function usePokemons(): UsePokemonsReturn {
  const {pokemons, setPokemons} = usePokemonStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const fetchPokemons = async () => {
      setLoading(true)
      setError(null)

      try {
        const offset = page * LIMIT
        const listRes = await axios.get(
          `${POKEAPI_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`,
          { signal: controller.signal }
        )

        setHasNext(!!listRes.data.next)
        setHasPrev(!!listRes.data.previous)

        const urls  = listRes.data.results.map((item: { url: string }) => item.url)
        const detailResponses = await fetchDetails(urls, controller.signal)

        setPokemons(detailResponses)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch pokemons')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPokemons()

    return () => controller.abort()
  }, [page, setPokemons])

  return {
    pokemons,
    loading,
    error,
    page,
    hasNext,
    hasPrev,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(0, p - 1)),
  }
}
