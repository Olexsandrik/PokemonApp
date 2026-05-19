export interface PokemonStat {
  name: string
  value: number
}

export interface Pokemon {
  id: number
  name: string
  sprite: string
  types: string[]
  abilities: string[]
  stats: PokemonStat[]
  height: number
  weight: number
  baseExperience: number
}

interface PokeListItem {
  name: string
  url: string
}

interface PokeListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokeListItem[]
}

interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: {
    front_default: string | null
  }
  types: Array<{
    type: { name: string }
  }>
  abilities: Array<{
    ability: { name: string }
    is_hidden: boolean
  }>
  stats: Array<{
    base_stat: number
    stat: { name: string }
  }>
}

export type { PokeListResponse, PokemonDetail }
