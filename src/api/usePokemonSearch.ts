import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { Pokemon } from './types'
import { usePokemonStore } from '../store/usePokemonStore'
import { fetchDetails } from './utility/fetchPokemonDetails'


const POKEAPI_BASE = import.meta.env.VITE_API_BASE_URL || 'https://pokeapi.co/api/v2'
const LIMIT = Number(import.meta.env.VITE_POKEMON_LIMIT) || 24

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


export function usePokemonSearch(
  query: string,
  type: string
): UsePokemonSearchReturn {

  const {pokemons , setPokemons} = usePokemonStore();
  const [loading, setLoading] = useState(false);
  const [allUrls, setAllUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  
  useEffect(() => {
    const controller = new AbortController()

    const buildUrlList = async () => {
      setLoading(true)
      setError(null)
      setPage(0)

      try {
        let urls: string[] = []

        if (type) { // all type
          
          const res = await axios.get(`${POKEAPI_BASE}/type/${type}`, {
            signal: controller.signal,
          })
          urls = res.data.pokemon.map(
            (entry: { pokemon: { url: string } }) => entry.pokemon.url
          )
        } else {
          // Fetch the full flat list of all Pokemon names+urls
          const res = await axios.get(
            `${POKEAPI_BASE}/pokemon?limit=${LIMIT}&offset=${page * LIMIT}`,
            { signal: controller.signal }
          )
          urls = res.data.results.map((p: { url: string }) => p.url)
        }

        // Filter by name or id if query is set
        if (query.trim()) {
          const q = query.trim().toLowerCase()
          urls = urls.filter((url) => {
         
            const parts = url.replace(/\/$/, '').split('/')
            const id = parts[parts.length - 1]

            return id.includes(q)
          })


          if (isNaN(Number(q))) {
            const res = await axios.get(
              `${POKEAPI_BASE}/pokemon?limit=${LIMIT}&offset=${page * LIMIT}`,
              { signal: controller.signal }
            )
            const nameMatches: string[] = res.data.results
              .filter((p: { name: string; url: string }) =>
                p.name.toLowerCase().includes(q)
              )
              .map((p: { url: string }) => p.url)

    
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
  }, [query, type, page])

 
  useEffect(() => {
    if (allUrls.length === 0) {
      setPokemons([])
      return
    }

    const controller = new AbortController()
    const pageUrls = allUrls.slice(page * LIMIT, (page + 1) * LIMIT)

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
  }, [allUrls, page, setPokemons])

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
