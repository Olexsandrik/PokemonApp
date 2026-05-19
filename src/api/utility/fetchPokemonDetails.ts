import axios from "axios"
import type { Pokemon, PokemonDetail } from "../types"

export async function fetchDetails(urls: string[], signal: AbortSignal): Promise<Pokemon[]> {
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