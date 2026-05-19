import { Card, CardMedia, CardContent, Box, Chip, IconButton, Typography } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import type { Pokemon } from '../api/types'
import { useFavoritesStore } from '../store/useFavoritesStore'

interface PokemonCardProps {
  pokemon: Pokemon
  onSelect: (pokemon: Pokemon) => void
}

export function PokemonCard({ pokemon, onSelect }: PokemonCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorite(pokemon.id)

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favorited) {
      removeFavorite(pokemon.id)
    } else {
      addFavorite(pokemon)
    }
  }

  return (
    <Card
      onClick={() => onSelect(pokemon)}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box sx={{ position: 'relative', p: 1 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#333',
            color: '#fff',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          #{pokemon.id}
        </Box>
        <CardMedia
          component="img"
          image={pokemon.sprite}
          alt={pokemon.name}
          sx={{
            height: 120,
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      </Box>

      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          {pokemon.types.map((type) => (
            <Chip
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              size="small"
              sx={{ height: 24 }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={handleFavoriteToggle}
            sx={{ color: favorited ? '#e74c3c' : '#95a5a6' }}
          >
            {favorited ? (
              <FavoriteIcon sx={{ fontSize: '1.2rem' }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />
            )}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}
