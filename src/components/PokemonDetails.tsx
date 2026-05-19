import {
  Box,
  Drawer,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { Pokemon } from '../api/types'

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

interface PokemonDetailsProps {
  pokemon: Pokemon | null
  open: boolean
  onClose: () => void
}

export function PokemonDetails({ pokemon, open, onClose }: PokemonDetailsProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 340, p: 3 } } }}
    >
      {pokemon && (
        <>
          {/* Header: ID + close */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
              #{pokemon.id}
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Name */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Typography>

          {/* Types */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {pokemon.types.map((type) => (
              <Chip
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                size="small"
              />
            ))}
          </Box>

          {/* Image */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box
              component="img"
              src={pokemon.sprite}
              alt={pokemon.name}
              sx={{ height: 160, objectFit: 'contain' }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Height / Weight / Base Experience */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              mb: 2,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">Height</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(pokemon.height / 10).toFixed(1)} m
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Weight</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(pokemon.weight / 10).toFixed(1)} kg
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Base Exp</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {pokemon.baseExperience}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Abilities */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Abilities
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {pokemon.abilities.map((ability) => (
                <Chip
                  key={ability}
                  label={ability.replace(/-/g, ' ')}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Stats */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Stats
            </Typography>
            <Stack spacing={1}>
              {pokemon.stats.map((stat) => (
                <Box key={stat.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {STAT_LABELS[stat.name] ?? stat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stat.value / 255) * 100, 100)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  )
}
