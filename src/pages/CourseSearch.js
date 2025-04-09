import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Button, Box, Collapse, Grid, Select, MenuItem, Chip, Stack, Typography, Container } from '@mui/material'
import CourseList from '../components/courses/CourseList'
import RegistrationModal from '../components/RegistrationModal'
import { SectionHeader, BodyText } from '../components/ui/typography.jsx'
import { City, State } from 'country-state-city'
import { cardStyles } from '../styles/theme/components/cards'
import SearchBar from '../components/ui/SearchBar'
import LocationSearchBar from '../components/ui/LocationSearchBar'
import RadiusSelector from '../components/ui/RadiusSelector'

const AVAILABLE_SUBJECTS = [
  'History',
  'English',
  'Mathematics',
  'Science',
  'Language Other Than English',
  'Visual & Performing Arts',
  'College-Preparatory Elective',
]

const AVAILABLE_TERMS = ['Spring 2025', 'Summer 2025']

const AVAILABLE_PROVIDERS = ['Community Colleges', 'College/University', 'Microschool', 'Co-op', 'Online School']

const AVAILABLE_EXTRACURRICULARS = {
  Sports: ['Baseball', 'Basketball', 'Football', 'Soccer', 'Swimming', 'Tennis', 'Track & Field', 'Volleyball'],
  Clubs: [
    'Art Club',
    'Chess Club',
    'Debate Club',
    'Drama Club',
    'Music Band',
    'Robotics Club',
    'Science Club',
    'Student Government',
  ],
}

const PRICE_RANGES = ['Free', 'Under $100', '$100 - $250', '$250 - $500', '$500+']

const RATING_FILTERS = ['4★ & Up', '3★ & Up', '2★ & Up', '1★ & Up']

const SUBJECT_DISPLAY_NAMES = {
  History: 'A. History',
  English: 'B. English',
  Mathematics: 'C. Mathematics',
  Science: 'D. Science',
  'Language Other Than English': 'E. Language',
  'Visual & Performing Arts': 'F. Visual & Performing Arts',
  'College-Preparatory Elective': 'G. Elective',
}

const MILE_RADIUS_OPTIONS = [5, 10, 25, 50, 100]

const CourseSearch = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [subjectFilters, setSubjectFilters] = useState([])
  const [termFilters, setTermFilters] = useState([])
  const [providerFilters, setProviderFilters] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [expandedSections, setExpandedSections] = useState({
    subjects: false,
    terms: false,
    providers: false,
    extracurricular: false,
    price: false,
    rating: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 50
  const [expandedCourses, setExpandedCourses] = useState({})
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '')
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '')
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const locationSearchRef = useRef(null)

  const modalRef = useRef(null)
  const [priceFilter, setPriceFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [extracurricularFilters, setExtracurricularFilters] = useState([])
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState(null)
  const [mileRadius, setMileRadius] = useState(parseInt(searchParams.get('mileRadius')) || 25) // Get from URL or default to 25

  // Add state to track if update is from URL
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(true)

  // Update mileRadius when URL params change
  useEffect(() => {
    const radiusFromParams = searchParams.get('mileRadius')
    if (radiusFromParams) {
      setMileRadius(parseInt(radiusFromParams))
    }
  }, [searchParams])

  // Update the URL effect to not run when loading from URL
  useEffect(() => {
    if (!isLoadingFromUrl) {
      updateURLWithFilters()
    }
  }, [subjectFilters, providerFilters, extracurricularFilters, isLoadingFromUrl])

  // Update the filter loading effect
  useEffect(() => {
    const loadFiltersFromURL = () => {
      setIsLoadingFromUrl(true)
      // Get filter params from URL
      const subjectsParam = searchParams.get('subjects')
      const providersParam = searchParams.get('providers')
      const extracurricularsParam = searchParams.get('extracurriculars')

      // Set filters from URL parameters
      if (subjectsParam) {
        const subjects = subjectsParam.split(',')
        setSubjectFilters(subjects)
      }
      if (providersParam) {
        const providers = providersParam.split(',')
        setProviderFilters(providers)
      }
      if (extracurricularsParam) {
        const extracurriculars = extracurricularsParam.split(',')
        setExtracurricularFilters(extracurriculars)
      }
      setIsLoadingFromUrl(false)
    }
    loadFiltersFromURL()
  }, [searchParams])

  // Location search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery) {
        setShowLocationSuggestions(true)
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
        .map((city) => `${city.name}, ${city.stateCode}`)
        .slice(0, 8) // Limit to 8 suggestions for better UX

      setLocationSuggestions(filteredCities)
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setLocationSuggestions([])
    }
  }

  // Helper function to toggle a filter value
  const toggleFilter = (value, currentFilters, setFilters) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter((item) => item !== value))
    } else {
      setFilters([...currentFilters, value])
    }
  }

  const toggleCourseExpansion = (courseCode) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseCode]: !prev[courseCode],
    }))
  }

  const handleRegisterClick = (course) => {
    setSelectedCourse(course)
    setIsRegistrationModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedCourse(null)
    setIsRegistrationModalOpen(false)
  }

  // Simplify handleSearch to just update input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Update URL on Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams)
      if (searchQuery?.trim()) {
        params.set('q', searchQuery)
      } else {
        params.delete('q')
      }
      if (selectedLocation) params.set('location', selectedLocation)
      params.set('mileRadius', mileRadius.toString())
      params.set('page', '0')
      setSearchParams(params)
    }
  }

  // Load initial data when the page loads with search params
  useEffect(() => {
    const query = searchParams.get('q')
    const radius = searchParams.get('mileRadius')
    const location = searchParams.get('location')

    if (radius) {
      setMileRadius(parseInt(radius))
    }
    if (location) {
      setSelectedLocation(location)
      setLocationQuery(location)
    }
    if (query?.trim()) {
      setSearchQuery(query)
    } else {
      // Reset all states when no query
      setSearchQuery('')
    }
  }, [searchParams])

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setLocationQuery(location)
    setShowLocationSuggestions(false)
    const params = new URLSearchParams(searchParams)
    params.set('q', searchQuery)
    params.set('location', location)
    params.set('mileRadius', mileRadius.toString())
    setSearchParams(params)
  }

  const clearLocation = () => {
    setSelectedLocation('')
    setLocationQuery('')
    const params = new URLSearchParams(searchParams)
    if (searchQuery) params.set('q', searchQuery)
    params.set('mileRadius', mileRadius.toString())
    setSearchParams(params)
  }

  // Add function to update URL when filters change
  const updateURLWithFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }

    if (subjectFilters.length) {
      params.set('subjects', subjectFilters.join(','))
    } else {
      params.delete('subjects')
    }

    if (termFilters.length) {
      params.set('terms', termFilters.join(','))
    } else {
      params.delete('terms')
    }

    if (priceFilter) {
      params.set('price', priceFilter)
    } else {
      params.delete('price')
    }

    if (providerFilters.length) {
      params.set('providers', providerFilters.join(','))
    } else {
      params.delete('providers')
    }

    if (extracurricularFilters.length) {
      params.set('extracurriculars', extracurricularFilters.join(','))
    } else {
      params.delete('extracurriculars')
    }

    setSearchParams(params)
  }

  // Update the URL effect to not run when loading from URL
  useEffect(() => {
    if (!isLoadingFromUrl) {
      updateURLWithFilters()
    }
  }, [subjectFilters, termFilters, priceFilter, providerFilters, isLoadingFromUrl])

  useEffect(() => {
    // Get initial filters from URL
    const params = new URLSearchParams(location.search)

    const queryParam = params.get('q')
    if (queryParam) setSearchQuery(queryParam)

    const subjectsParam = params.get('subjects')
    if (subjectsParam) setSubjectFilters(subjectsParam.split(','))

    const termsParam = params.get('terms')
    if (termsParam) setTermFilters(termsParam.split(','))

    const priceParam = params.get('price')
    if (priceParam) setPriceFilter(priceParam)

    const providersParam = params.get('providers')
    if (providersParam) setProviderFilters(providersParam.split(','))

    const extracurricularsParam = params.get('extracurriculars')
    if (extracurricularsParam) setExtracurricularFilters(extracurricularsParam.split(','))

    setIsLoadingFromUrl(false)
  }, [location.search])

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
            This page still needs lots of work. Directory currently includes community colleges in the SF Bay Area — Foothill, De Anza, Mission, SFCC and Sierra. Feedback welcomed.
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
            <Grid container spacing={2} sx={{ mb: 'var(--spacing-2)' }}>
              {/* Main Search Bar */}
              <Grid item xs={6}>
                <SearchBar
                  placeholder="Search courses by title, subject, or provider..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                />
              </Grid>

              {/* Location Search */}
              <Grid item xs={3} ref={locationSearchRef}>
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
              </Grid>

              {/* Mile Radius Selector */}
              <Grid item xs={3}>
                <RadiusSelector
                  value={mileRadius}
                  onChange={(e) => {
                    setMileRadius(e.target.value)
                    const params = new URLSearchParams(searchParams)
                    params.set('mileRadius', e.target.value.toString())
                    setSearchParams(params)
                  }}
                  options={MILE_RADIUS_OPTIONS}
                />
              </Grid>
            </Grid>

            {/* Active Filters Chips */}
            {(subjectFilters.length > 0 ||
              termFilters.length > 0 ||
              providerFilters.length > 0 ||
              extracurricularFilters.length > 0 ||
              priceFilter ||
              ratingFilter ||
              selectedLocation) && (
              <Box
                sx={{
                  p: 'var(--spacing-2)',
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    '& > *': {
                      mb: 1,
                      mt: 1,
                    },
                  }}
                >
                  {subjectFilters.map((filter) => (
                    <Chip
                      key={`subject-${filter}`}
                      label={SUBJECT_DISPLAY_NAMES[filter] || filter}
                      onDelete={() => toggleFilter(filter, subjectFilters, setSubjectFilters)}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  ))}
                  {termFilters.map((filter) => (
                    <Chip
                      key={`term-${filter}`}
                      label={filter}
                      onDelete={() => toggleFilter(filter, termFilters, setTermFilters)}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  ))}
                  {providerFilters.map((filter) => (
                    <Chip
                      key={`provider-${filter}`}
                      label={filter}
                      onDelete={() => toggleFilter(filter, providerFilters, setProviderFilters)}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  ))}
                  {extracurricularFilters.map((filter) => (
                    <Chip
                      key={`extracurricular-${filter}`}
                      label={filter}
                      onDelete={() => toggleFilter(filter, extracurricularFilters, setExtracurricularFilters)}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  ))}
                  {priceFilter && (
                    <Chip
                      label={priceFilter}
                      onDelete={() => setPriceFilter('')}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  )}
                  {ratingFilter && (
                    <Chip
                      label={ratingFilter}
                      onDelete={() => setRatingFilter('')}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  )}
                  {selectedLocation && (
                    <Chip
                      label={`📍 ${selectedLocation}`}
                      onDelete={clearLocation}
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--text-primary))',
                        '& .MuiChip-deleteIcon': {
                          color: 'hsl(var(--text-primary))',
                          '&:hover': {
                            color: 'hsl(var(--brand-primary))',
                          },
                        },
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: 'var(--spacing-4)',
          px: 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
          backgroundColor: 'hsl(var(--background))',
        }}
      >
        {/* Filters Section */}
        <Box sx={{ display: 'flex', gap: 'var(--spacing-6)' }}>
          {/* Left Sidebar - Filters */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Box
              sx={{
                pt: 'var(--spacing-4)',
              }}
            >
              <Box
                sx={{
                  p: 'var(--spacing-4)',
                  backgroundColor: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius-lg)',
                  mb: 'var(--spacing-4)',
                }}
              >
                <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Filters</SectionHeader>

                {/* Subject Filters */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() => setExpandedSections({ ...expandedSections, subjects: !expandedSections.subjects })}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Subject</BodyText>
                    <span>{expandedSections.subjects ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.subjects}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        p: 'var(--spacing-2)',
                      }}
                    >
                      {AVAILABLE_SUBJECTS.map((subject) => (
                        <Button
                          key={subject}
                          onClick={() => toggleFilter(subject, subjectFilters, setSubjectFilters)}
                          variant={subjectFilters.includes(subject) ? 'contained' : 'outlined'}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: subjectFilters.includes(subject)
                              ? 'hsl(var(--brand-primary))'
                              : 'transparent',
                            color: subjectFilters.includes(subject)
                              ? 'hsl(var(--background))'
                              : 'hsl(var(--text-primary))',
                            borderColor: subjectFilters.includes(subject)
                              ? 'hsl(var(--brand-primary))'
                              : 'hsl(var(--border))',
                            '&:hover': {
                              backgroundColor: subjectFilters.includes(subject)
                                ? 'hsl(var(--brand-primary-dark))'
                                : 'hsla(var(--brand-primary), 0.1)',
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {SUBJECT_DISPLAY_NAMES[subject] || subject}
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {/* Term Filters */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() => setExpandedSections({ ...expandedSections, terms: !expandedSections.terms })}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Term</BodyText>
                    <span>{expandedSections.terms ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.terms}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        p: 'var(--spacing-2)',
                      }}
                    >
                      {AVAILABLE_TERMS.map((term) => (
                        <Button
                          key={term}
                          onClick={() => toggleFilter(term, termFilters, setTermFilters)}
                          variant={termFilters.includes(term) ? 'contained' : 'outlined'}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: termFilters.includes(term) ? 'hsl(var(--brand-primary))' : 'transparent',
                            color: termFilters.includes(term) ? 'hsl(var(--background))' : 'hsl(var(--text-primary))',
                            borderColor: termFilters.includes(term)
                              ? 'hsl(var(--brand-primary))'
                              : 'hsl(var(--border))',
                            '&:hover': {
                              backgroundColor: termFilters.includes(term)
                                ? 'hsl(var(--brand-primary-dark))'
                                : 'hsla(var(--brand-primary), 0.1)',
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {term}
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {/* Providers Filter */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() => setExpandedSections({ ...expandedSections, providers: !expandedSections.providers })}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Providers</BodyText>
                    <span>{expandedSections.providers ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.providers}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        p: 'var(--spacing-2)',
                      }}
                    >
                      {AVAILABLE_PROVIDERS.map((provider) => (
                        <Button
                          key={provider}
                          onClick={() => toggleFilter(provider, providerFilters, setProviderFilters)}
                          variant={providerFilters.includes(provider) ? 'contained' : 'outlined'}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: providerFilters.includes(provider)
                              ? 'hsl(var(--brand-primary))'
                              : 'transparent',
                            color: providerFilters.includes(provider)
                              ? 'hsl(var(--background))'
                              : 'hsl(var(--text-primary))',
                            borderColor: providerFilters.includes(provider)
                              ? 'hsl(var(--brand-primary))'
                              : 'hsl(var(--border))',
                            '&:hover': {
                              backgroundColor: providerFilters.includes(provider)
                                ? 'hsl(var(--brand-primary-dark))'
                                : 'hsla(var(--brand-primary), 0.1)',
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {provider}
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {/* Extracurricular Filter */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() =>
                      setExpandedSections({ ...expandedSections, extracurricular: !expandedSections.extracurricular })
                    }
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Extracurricular</BodyText>
                    <span>{expandedSections.extracurricular ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.extracurricular}>
                    <Box sx={{ p: 'var(--spacing-2)' }}>
                      {Object.entries(AVAILABLE_EXTRACURRICULARS).map(([category, activities]) => (
                        <Box key={category} sx={{ mb: 'var(--spacing-3)' }}>
                          <BodyText sx={{ mb: 'var(--spacing-2)', fontWeight: 600 }}>{category}</BodyText>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'var(--spacing-2)',
                            }}
                          >
                            {activities.map((activity) => (
                              <Button
                                key={activity}
                                onClick={() =>
                                  toggleFilter(activity, extracurricularFilters, setExtracurricularFilters)
                                }
                                variant={extracurricularFilters.includes(activity) ? 'contained' : 'outlined'}
                                sx={{
                                  justifyContent: 'flex-start',
                                  backgroundColor: extracurricularFilters.includes(activity)
                                    ? 'hsl(var(--brand-primary))'
                                    : 'transparent',
                                  color: extracurricularFilters.includes(activity)
                                    ? 'hsl(var(--background))'
                                    : 'hsl(var(--text-primary))',
                                  borderColor: extracurricularFilters.includes(activity)
                                    ? 'hsl(var(--brand-primary))'
                                    : 'hsl(var(--border))',
                                  '&:hover': {
                                    backgroundColor: extracurricularFilters.includes(activity)
                                      ? 'hsl(var(--brand-primary-dark))'
                                      : 'hsla(var(--brand-primary), 0.1)',
                                    borderColor: 'hsl(var(--brand-primary))',
                                  },
                                  textTransform: 'none',
                                }}
                              >
                                {activity}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {/* Price Range Filter */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() => setExpandedSections({ ...expandedSections, price: !expandedSections.price })}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Price Range</BodyText>
                    <span>{expandedSections.price ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.price}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        p: 'var(--spacing-2)',
                      }}
                    >
                      {PRICE_RANGES.map((range) => (
                        <Button
                          key={range}
                          onClick={() => setPriceFilter(priceFilter === range ? '' : range)}
                          variant={priceFilter === range ? 'contained' : 'outlined'}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: priceFilter === range ? 'hsl(var(--brand-primary))' : 'transparent',
                            color: priceFilter === range ? 'hsl(var(--background))' : 'hsl(var(--text-primary))',
                            borderColor: priceFilter === range ? 'hsl(var(--brand-primary))' : 'hsl(var(--border))',
                            '&:hover': {
                              backgroundColor:
                                priceFilter === range
                                  ? 'hsl(var(--brand-primary-dark))'
                                  : 'hsla(var(--brand-primary), 0.1)',
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {range}
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {/* Rating Filter */}
                <Box sx={{ mb: 'var(--spacing-4)' }}>
                  <Button
                    onClick={() => setExpandedSections({ ...expandedSections, rating: !expandedSections.rating })}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      p: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      },
                    }}
                  >
                    <BodyText>Rating</BodyText>
                    <span>{expandedSections.rating ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={expandedSections.rating}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        p: 'var(--spacing-2)',
                      }}
                    >
                      {RATING_FILTERS.map((rating) => (
                        <Button
                          key={rating}
                          onClick={() => setRatingFilter(ratingFilter === rating ? '' : rating)}
                          variant={ratingFilter === rating ? 'contained' : 'outlined'}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: ratingFilter === rating ? 'hsl(var(--brand-primary))' : 'transparent',
                            color: ratingFilter === rating ? 'hsl(var(--background))' : 'hsl(var(--text-primary))',
                            borderColor: ratingFilter === rating ? 'hsl(var(--brand-primary))' : 'hsl(var(--border))',
                            '&:hover': {
                              backgroundColor:
                                ratingFilter === rating
                                  ? 'hsl(var(--brand-primary-dark))'
                                  : 'hsla(var(--brand-primary), 0.1)',
                              borderColor: 'hsl(var(--brand-primary))',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {rating}
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Main Content Area - Course List */}
          <Box sx={{ flex: 1 }}>
            <CourseList
              searchQuery={searchQuery}
              selectedLocation={selectedLocation}
              mileRadius={mileRadius}
              subjectFilters={subjectFilters}
              providerFilters={providerFilters}
              extracurricularFilters={extracurricularFilters}
              termFilters={termFilters}
              priceFilter={priceFilter}
              ratingFilter={ratingFilter}
              onRegisterClick={handleRegisterClick}
            />
          </Box>
        </Box>
      </Container>

      {/* Modals */}
      {selectedCourse && (
        <RegistrationModal open={isRegistrationModalOpen} onClose={handleCloseModal} course={selectedCourse} />
      )}
    </Box>
  )
}

export default CourseSearch
