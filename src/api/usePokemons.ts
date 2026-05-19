import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Pokemon, PokemonDetail } from './types'
import { usePokemonStore } from '../store/usePokemonStore';


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

        const detailPromises = listRes.data.results.map((item: { url: string }) =>
          axios.get<PokemonDetail>(item.url, { signal: controller.signal })
        )

        const detailResponses = await Promise.all(detailPromises)

        const parsed: Pokemon[] = detailResponses.map((res) => ({
          id: res.data.id,
          name: res.data.name,
          sprite: res.data.sprites.front_default || '',
          types: res.data.types.map((t: PokemonDetail['types'][0]) => t.type.name),
          height: res.data.height,
          weight: res.data.weight,
          baseExperience: res.data.base_experience,
          abilities: res.data.abilities.map(
            (a: PokemonDetail['abilities'][0]) => a.ability.name
          ),
          stats: res.data.stats.map((s: PokemonDetail['stats'][0]) => ({
            name: s.stat.name,
            value: s.base_stat,
          })),
        }))

        setPokemons(parsed)
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
