import { useState } from 'react'
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material'
import { usePokemons } from './api/usePokemons'
import { usePokemonSearch } from './api/usePokemonSearch'
import { PokemonCard } from './components/PokemonCard'
import { PokemonDetails } from './components/PokemonDetails'
import type { Pokemon } from './api/types'
import { usePokemonStore } from './store/usePokemonStore'



const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

function App() {
  const {pokemonItem: selectedPokemon, setPokemonItem: setSelectedPokemon } = usePokemonStore()

  const [drawerOpen, setDrawerOpen] = useState(false)

  // Form input state
  const [searchInput, setSearchInput] = useState('')
  const [typeInput, setTypeInput] = useState('')

  // Active search params (only updated on submit)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const isSearchActive = search.trim() !== '' || typeFilter !== ''

  const normal = usePokemons()
  const searchResult = usePokemonSearch(search, typeFilter)

  const active = isSearchActive ? searchResult : normal

  const handleSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
    setDrawerOpen(true)
  }

  const handleSearch = () => {
    setSearch(searchInput)
    setTypeFilter(typeInput)
  }

  const handleReset = () => {
    setSearchInput('')
    setTypeInput('')
    setSearch('')
    setTypeFilter('')
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 3, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        {active.error && <Alert severity="error" sx={{ mb: 2 }}>{active.error}</Alert>}

        {/* Filters row */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by name or ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeInput}
              label="Type"
              onChange={(e) => setTypeInput(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {ALL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleSearch} size="medium">
            Search
          </Button>

          <Button variant="outlined" onClick={handleReset} size="medium">
            Reset
          </Button>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', mb: 3 }}>
          <button
            onClick={active.prevPage}
            disabled={!active.hasPrev}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: active.hasPrev ? 'pointer' : 'not-allowed',
              opacity: active.hasPrev ? 1 : 0.5,
            }}
          >
            PREV
          </button>

          <Box sx={{ minWidth: 160, textAlign: 'center', fontSize: '0.9rem' }}>
            {'totalPages' in active
              ? `page ${active.page + 1} / ${active.totalPages}`
              : `page ${active.page + 1}`}
          </Box>

          <button
            onClick={active.nextPage}
            disabled={!active.hasNext}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: active.hasNext ? 'pointer' : 'not-allowed',
              opacity: active.hasNext ? 1 : 0.5,
            }}
          >
            NEXT
          </button>
        </Box>

        {active.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
              '@media (max-width: 768px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
              '@media (max-width: 600px)': { gridTemplateColumns: 'repeat(1, 1fr)' },
            }}
          >
            {active.pokemons.map((pokemon: Pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={handleSelect} />
            ))}
          </Box>
        )}
      </Container>

      <PokemonDetails
        pokemon={selectedPokemon}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  )
}

export default App
