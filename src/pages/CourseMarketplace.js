import React, { useState, useRef, useEffect } from 'react'
import { Box, Container, Grid, Typography, Button, Select, MenuItem, keyframes } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { City, State } from 'country-state-city'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import SearchBar from '../components/ui/SearchBar'
import LocationSearchBar from '../components/ui/LocationSearchBar'
import RadiusSelector from '../components/ui/RadiusSelector'

import { cardStyles } from '../styles/theme/components/cards'

// Quick search categories
const CORE_SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Foreign Language', 'Computer Science']

const ELECTIVE_SUBJECTS = ['Art', 'Music', 'Theater', 'Photography', 'Creative Writing', 'Psychology']

const EXTRACURRICULARS = ['Sports', 'Clubs', 'Volunteer Work', 'Leadership', 'Debate', 'Model UN']

const PROVIDERS = ['Community Colleges', 'Universities', 'Microschools', 'Co-ops', 'Online Schools']

const HOT_NEAR_YOU = [
  'SAT Prep',
  'College Essay Writing',
  'AP Biology',
  'Robotics Club',
  'Coding Bootcamp',
  'Art Portfolio',
]

const MATERIALS = ['Textbooks', 'Learning Kits', 'Workbooks', 'Home Laboratory', 'Specialty Materials']

const MILE_RADIUS_OPTIONS = [5, 10, 25, 50, 100]

// Update the SUBJECT_MAPPING object
const SUBJECT_MAPPING = {
  // Core Subjects
  Mathematics: 'Mathematics',
  Science: 'Science',
  English: 'English',
  History: 'History',
  'Foreign Language': 'Language Other Than English',
  // Remove Computer Science from subject mapping

  // Elective Subjects
  Art: 'Visual & Performing Arts',
  Music: 'Visual & Performing Arts',
  Theater: 'Visual & Performing Arts',
  Photography: 'Visual & Performing Arts',
  'Creative Writing': 'English',
  Psychology: 'College-Preparatory Elective',

  // Materials (map to relevant subjects)
  Textbooks: null,
  'Learning Kits': null,
  Workbooks: null,
  'Home Laboratory': 'Science',
  'Specialty Materials': null,
}

// Update PROVIDER_MAPPING to match exactly
const PROVIDER_MAPPING = {
  'Community Colleges': 'Community Colleges',
  Universities: 'College/University',
  Microschools: 'Microschool',
  'Co-ops': 'Co-op',
  'Online Schools': 'Online School',
}

const CourseMarketplace = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '')
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '')
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const locationSearchRef = useRef(null)
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState(null)
  const [mileRadius, setMileRadius] = useState(25) // Default to 25 miles
  const [animateLocation, setAnimateLocation] = useState(false)
  const [animateRadius, setAnimateRadius] = useState(false)
  const [animateSearch, setAnimateSearch] = useState(false)

  // Load user's location from profile
  useEffect(() => {
    const loadUserLocation = async () => {
      if (user && !selectedLocation) {
        try {
          const { data: profile, error } = await supabase
            .from('account_profiles')
            .select('city, state')
            .eq('id', user.id)
            .single()

          if (error) throw error

          if (profile?.city && profile?.state) {
            const locationString = `${profile.city}, ${profile.state}`
            setLocationQuery(locationString)
            setSelectedLocation(locationString)
          }
        } catch (error) {
          console.error('Error loading user location:', error)
        }
      }
    }

    loadUserLocation()
  }, [user])

  // Location search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery) {
        fetchLocationSuggestions(locationQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [locationQuery])

  // Click outside to close location suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationSearchRef.current && !locationSearchRef.current.contains(event.target)) {
        setShowLocationSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Trigger animations after a short delay when component mounts
  useEffect(() => {
    const locationTimer = setTimeout(() => {
      setAnimateLocation(true)
    }, 500)
    
    const radiusTimer = setTimeout(() => {
      setAnimateRadius(true)
    }, 800)
    
    return () => {
      clearTimeout(locationTimer)
      clearTimeout(radiusTimer)
    }
  }, [])

  // Trigger animation after a short delay when component mounts
  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setAnimateSearch(true)
    }, 500)
    
    return () => {
      clearTimeout(animationTimer)
    }
  }, [])

  const fetchLocationSuggestions = async (query) => {
    try {
      // Get all US states
      const usStates = State.getStatesOfCountry('US')

      // Get cities for all states
      const allCities = usStates.flatMap((state) => {
        const stateCities = City.getCitiesOfState('US', state.isoCode)
        return stateCities.map((city) => ({
          name: city.name,
          state: state.name,
          stateCode: state.isoCode,
        }))
      })

      // Filter cities based on the query
      const filteredCities = allCities
        .filter((city) => {
          const cityState = `${city.name}, ${city.stateCode}`.toLowerCase()
          return cityState.includes(query.toLowerCase())
        })
        .slice(0, 8) // Limit to 8 suggestions

      setLocationSuggestions(filteredCities)
      setShowLocationSuggestions(true)
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(
        `/course-search/results?q=${encodeURIComponent(searchQuery)}${
          selectedLocation ? `&location=${encodeURIComponent(selectedLocation)}` : ''
        }&mileRadius=${mileRadius}`
      )
    }
  }

  const handleQuickSearch = (query, filterType) => {
    const params = new URLSearchParams()

    switch (filterType) {
      case 'subject':
        // Special case for Computer Science
        if (query === 'Computer Science') {
          params.set('q', 'computer')
        } else {
          const mappedSubject = SUBJECT_MAPPING[query]
          if (mappedSubject) {
            params.set('subjects', mappedSubject)
          } else {
            params.set('q', query)
          }
        }
        break
      case 'provider':
        const mappedProvider = PROVIDER_MAPPING[query]
        if (mappedProvider) {
          params.set('providers', mappedProvider)
        } else {
          params.set('q', query)
        }
        break
      case 'extracurricular':
        params.set('q', query)
        break
      default:
        if (query) params.set('q', query)
    }

    // Add location params if they exist
    if (selectedLocation) params.set('location', selectedLocation)
    params.set('mileRadius', mileRadius.toString())

    navigate(`/course-search/results?${params.toString()}`)
  }

  const handleLocationSelect = (location) => {
    const locationString = `${location.name}, ${location.stateCode}`
    setSelectedLocation(locationString)
    setLocationQuery(locationString)
    setShowLocationSuggestions(false)
  }

  const clearLocation = () => {
    setSelectedLocation('')
    setLocationQuery('')
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 1.5
      }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography 
            sx={{ 
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1
            }}
          >
            This page still needs lots of work. Directory currently includes community colleges in SF Bay Area — Foothill, De Anza, Mission, SFCC, and Sierra. Feedback welcomed.
          </Typography>
        </Container>
      </Box>

      {/* Search Section */}
      <Box sx={cardStyles.section}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--container-padding-y)',
            '@media (max-width: 768px)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box>
            {/* Search Section */}
            <Grid container spacing={2} sx={{ mb: 'var(--spacing-6)' }}>
              {/* Main Search Bar */}
              <Grid item xs={6}>
                <Box
                  sx={{
                    animation: animateSearch ? 'jumpOnce 0.5s ease' : 'none',
                    '@keyframes jumpOnce': {
                      '0%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                      '100%': { transform: 'translateY(0)' }
                    }
                  }}
                >
                  <SearchBar
                    placeholder="Search courses by title, subject, or provider..."
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
                  />
                </Box>
              </Grid>

              {/* Location Search */}
              <Grid item xs={3} ref={locationSearchRef}>
                <Box
                  sx={{
                    animation: animateSearch ? 'jumpOnce 0.5s ease' : 'none',
                    '@keyframes jumpOnce': {
                      '0%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                      '100%': { transform: 'translateY(0)' }
                    }
                  }}
                >
                  <LocationSearchBar
                    placeholder="Set Location"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value)
                      if (e.target.value) {
                        setShowLocationSuggestions(true)
                        fetchLocationSuggestions(e.target.value)
                      } else {
                        setShowLocationSuggestions(false)
                      }
                    }}
                    showClearButton={!!selectedLocation}
                    onFocus={() => {
                      if (locationQuery) {
                        setShowLocationSuggestions(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowLocationSuggestions(false)
                      }, 200)
                    }}
                  />
                </Box>
              </Grid>

              {/* Mile Radius Selector */}
              <Grid item xs={3}>
                <Box
                  sx={{
                    animation: animateSearch ? 'jumpOnce 0.5s ease' : 'none',
                    '@keyframes jumpOnce': {
                      '0%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                      '100%': { transform: 'translateY(0)' }
                    }
                  }}
                >
                  <RadiusSelector
                    value={mileRadius}
                    onChange={(e) => setMileRadius(e.target.value)}
                    options={MILE_RADIUS_OPTIONS}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Quick Search Sections */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          pt: 'var(--spacing-4)',
          px: 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Grid container spacing={4}>
          {/* Providers - Now in top left */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"🏫"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Providers
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {PROVIDERS.map((provider) => (
                  <Button
                    key={provider}
                    onClick={() => handleQuickSearch(provider, 'provider')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {provider}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Core Subjects - Now on the right */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"📚"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Core Subjects
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {CORE_SUBJECTS.map((subject) => (
                  <Button
                    key={subject}
                    onClick={() => handleQuickSearch(subject, 'subject')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {subject}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Elective Subjects */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"🎨"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Elective Subjects
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {ELECTIVE_SUBJECTS.map((subject) => (
                  <Button
                    key={subject}
                    onClick={() => handleQuickSearch(subject, 'subject')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {subject}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Extracurriculars */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"🏆"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Extracurriculars
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {EXTRACURRICULARS.map((activity) => (
                  <Button
                    key={activity}
                    onClick={() => handleQuickSearch(activity, 'extracurricular')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {activity}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Hot Near You */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"🔥"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Hot Near You
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {HOT_NEAR_YOU.map((item) => (
                  <Button
                    key={item}
                    onClick={() => handleQuickSearch(item, 'extracurricular')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Materials */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 'var(--spacing-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 'var(--spacing-4)',
                  color: 'hsl(var(--text-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  '&::before': {
                    content: '"📦"',
                    fontSize: '1.2em',
                  },
                }}
              >
                Materials
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {MATERIALS.map((material) => (
                  <Button
                    key={material}
                    onClick={() => handleQuickSearch(material, 'subject')}
                    variant="outlined"
                    sx={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--text-primary))',
                      backgroundColor: 'hsl(var(--background))',
                      textTransform: 'none',
                      px: 'var(--spacing-4)',
                      py: 'var(--spacing-2)',
                      '&:hover': {
                        borderColor: 'hsl(var(--brand-primary))',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    {material}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default CourseMarketplace
