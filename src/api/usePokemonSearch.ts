import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { Pokemon, PokemonDetail } from './types'
import { usePokemonStore } from '../store/usePokemonStore'


const POKEAPI_BASE = import.meta.env.VITE_API_BASE_URL 
const LIMIT = Number(import.meta.env.VITE_POKEMON_LIMIT)

interface UsePokemonSearchReturn {
  pokemons: Pokemon[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  nextPage: () => void
  prevPage: () => void
  hasNext: boolean
  hasPrev: boolean
}

async function fetchDetails(urls: string[], signal: AbortSignal): Promise<Pokemon[]> {
  const responses = await Promise.all(
    urls.map((url) => axios.get<PokemonDetail>(url, { signal }))
  )
  return responses.map((res) => ({
    id: res.data.id,
    name: res.data.name,
    sprite: res.data.sprites.front_default || '',
    types: res.data.types.map((t) => t.type.name),
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
}

export function usePokemonSearch(
  query: string,
  type: string
): UsePokemonSearchReturn {

  const {pokemons , setPokemons} = usePokemonStore();
  const [loading, setLoading] = useState(false);
  const [allUrls, setAllUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  // Whenever query or type changes, rebuild the full list of matching URLs
  useEffect(() => {
    const controller = new AbortController()

    const buildUrlList = async () => {
      setLoading(true)
      setError(null)
      setPage(0)

      try {
        let urls: string[] = []

        if (type) {
          // Fetch all Pokemon of this type
          const res = await axios.get(`${POKEAPI_BASE}/type/${type}`, {
            signal: controller.signal,
          })
          urls = res.data.pokemon.map(
            (entry: { pokemon: { url: string } }) => entry.pokemon.url
          )
        } else {
          // Fetch the full flat list of all Pokemon names+urls
          const res = await axios.get(
            `${POKEAPI_BASE}/pokemon?limit=24&offset=0`,
            { signal: controller.signal }
          )
          urls = res.data.results.map((p: { url: string }) => p.url)
        }

        // Filter by name or id if query is set
        if (query.trim()) {
          const q = query.trim().toLowerCase()
          urls = urls.filter((url) => {
            // PokeAPI detail URLs end with /pokemon/{id}/
            const parts = url.replace(/\/$/, '').split('/')
            const id = parts[parts.length - 1]
            // We only have id from URL at this point; name filtering happens after detail fetch
            // So filter by id; name filter happens below after fetching the first page
            return id.includes(q)
          })

          // If query could be a name, also search by name from the full name list
          if (isNaN(Number(q))) {
            const res = await axios.get(
              `${POKEAPI_BASE}/pokemon?limit=100000&offset=0`,
              { signal: controller.signal }
            )
            const nameMatches: string[] = res.data.results
              .filter((p: { name: string; url: string }) =>
                p.name.toLowerCase().includes(q)
              )
              .map((p: { url: string }) => p.url)

            // Merge and deduplicate
            const merged = Array.from(new Set([...urls, ...nameMatches]))
            urls = merged
          }
        }

        setAllUrls(urls)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Search failed')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    buildUrlList()
    return () => controller.abort()
  }, [query, type])

 
  useEffect(() => {
    if (allUrls.length === 0) {
      setPokemons([])
      return
    }

    const controller = new AbortController()
    const pageUrls = allUrls.slice(page * LIMIT, (page + 1) * LIMIT)

    setLoading(true)
    fetchDetails(pageUrls, controller.signal)
      .then((data) => {
        setPokemons(data)
        setLoading(false)
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to load details')
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [allUrls, page])

  const totalPages = Math.ceil(allUrls.length / LIMIT)

  return {
    pokemons,
    loading,
    error,
    page,
    totalPages,
    hasNext: page < totalPages - 1,
    hasPrev: page > 0,
    nextPage: useCallback(() => setPage((p) => p + 1), []),
    prevPage: useCallback(() => setPage((p) => Math.max(0, p - 1)), []),
  }
}
