import { CardMedia, Box } from '@mui/material'
import type { Pokemon } from '../api/types'

interface PokemonImageProps {
  pokemon: Pokemon
  height?: number
}

export function PokemonImage({ pokemon, height = 120 }: PokemonImageProps) {
  return pokemon.sprite ? (
    <CardMedia
      component="img"
      image={pokemon.sprite}
      alt={pokemon.name}
      sx={{
        height,
        objectFit: 'contain',
        objectPosition: 'center',
      }}
    />
  ) : (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        color: '#999',
        fontSize: '0.875rem',
      }}
    >
      No image
    </Box>
  )
}
