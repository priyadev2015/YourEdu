import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material'
import {
  Description as DocumentIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  Gavel as ComplianceIcon,
  Search as SearchIcon,
  School as CollegeIcon,
  Add as AddIcon,
  Event as EventIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { cardStyles } from '../styles/theme/components/cards'

const ModuleView = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [greeting, setGreeting] = useState('')
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false)
  const [activeModules, setActiveModules] = useState([
    {
      id: 'documents',
      title: 'Documents & Record Keeping',
      description: 'Manage your homeschool documentation and records',
      icon: DocumentIcon,
      path: '/admin-materials',
      color: 'hsl(var(--brand-primary))',
    },
    {
      id: 'courses',
      title: 'Create & Manage Courses',
      description: 'Design and oversee your curriculum',
      icon: SchoolIcon,
      path: '/course-planning',
      color: 'hsl(var(--secondary-blue))',
    },
    {
      id: 'students',
      title: 'Add Students to Homeschool',
      description: 'Manage student profiles and enrollment',
      icon: PersonAddIcon,
      path: '/account/household',
      color: 'hsl(var(--secondary-green))',
    },
    {
      id: 'compliance',
      title: 'File State Compliance',
      description: 'Stay compliant with state regulations',
      icon: ComplianceIcon,
      path: '/compliance',
      color: 'hsl(var(--secondary-purple))',
    },
    {
      id: 'marketplace',
      title: 'Search Course Marketplace',
      description: 'Find and enroll in available courses',
      icon: SearchIcon,
      path: '/course-search',
      color: 'hsl(var(--secondary-orange))',
    },
    {
      id: 'college',
      title: 'College / Common App',
      description: 'Prepare for college applications',
      icon: CollegeIcon,
      path: '/college',
      color: 'hsl(var(--brand-primary-dark))',
    },
  ])

  const [availableModules, setAvailableModules] = useState([
    {
      id: 'events',
      title: 'Events & Groups',
      description: 'Join community events and groups',
      icon: EventIcon,
      path: '/events',
      color: 'hsl(var(--secondary-teal))',
    },
    // Add more available modules here
  ])

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon')
      } else {
        setGreeting('Good evening')
      }
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Hide the navbar when component mounts
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.style.marginLeft = '0'
    }

    // Show the navbar when component unmounts
    return () => {
      if (mainContent) {
        mainContent.style.marginLeft = '240px' // Default margin when navbar is shown
      }
    }
  }, [])

  const handleAddModule = (newModule) => {
    setActiveModules((prev) => [...prev, newModule])
    setAvailableModules((prev) => prev.filter(module => module.id !== newModule.id))
    setIsAddModuleOpen(false)
  }

  const handleRemoveModule = (moduleToRemove) => {
    setActiveModules((prev) => prev.filter(module => module.id !== moduleToRemove.id))
    setAvailableModules((prev) => [...prev, moduleToRemove])
  }

  const firstName = (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Parent')
    .split(' ')[0]
    .charAt(0)
    .toUpperCase() + (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Parent').split(' ')[0].slice(1)

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-3)' }}>
        <Container maxWidth="var(--container-max-width)">
          {/* Top buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
              }}
            >
              Back to Home
            </Button>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: '2.5rem',
              fontWeight: 600,
              color: 'hsl(var(--text-primary))',
              mb: 2,
              '&::after': {
                content: '""',
                display: 'block',
                width: 60,
                height: 4,
                backgroundColor: 'hsl(var(--brand-primary))',
                borderRadius: 'var(--radius-full)',
                mt: 2,
              },
            }}
          >
            {greeting}, {firstName}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'hsl(var(--text-secondary))',
              mb: 4,
            }}
          >
            Welcome to your personalized homeschool dashboard
          </Typography>
        </Container>
      </Box>

      {/* Modules Grid */}
      <Container maxWidth="var(--container-max-width)" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {activeModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card
                sx={{
                  ...cardStyles.default,
                  cursor: 'pointer',
                  height: '100%',
                  p: 3,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--shadow-lg)',
                    '& .module-icon': {
                      transform: 'scale(1.1)',
                      backgroundColor: `${module.color}20`,
                    },
                    '& .delete-button': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Delete button */}
                <IconButton
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveModule(module)
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    backgroundColor: 'hsla(var(--error), 0.1)',
                    color: 'hsl(var(--error))',
                    '&:hover': {
                      backgroundColor: 'hsla(var(--error), 0.2)',
                    },
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Box
                  onClick={() => navigate(module.path)}
                  sx={{ height: '100%' }}
                >
                  <Box
                    className="module-icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius)',
                      backgroundColor: `${module.color}10`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <module.icon sx={{ color: module.color, fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'hsl(var(--text-primary))',
                      mb: 1,
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'hsl(var(--text-secondary))',
                    }}
                  >
                    {module.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}

          {/* Add Module Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => setIsAddModuleOpen(true)}
              sx={{
                ...cardStyles.default,
                height: '100%',
                p: 3,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'hsl(var(--brand-primary))',
                  backgroundColor: 'hsla(var(--brand-primary), 0.05)',
                  '& .add-icon': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                  },
                },
              }}
            >
              <Box
                className="add-icon"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'hsla(var(--brand-primary), 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                <AddIcon sx={{ color: 'hsl(var(--brand-primary))', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'hsl(var(--brand-primary))',
                  textAlign: 'center',
                }}
              >
                Add Module
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Add Module Dialog */}
      <Dialog
        open={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add New Module
          </Typography>
          <IconButton onClick={() => setIsAddModuleOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {availableModules.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'hsl(var(--text-secondary))' }}>
                No more modules available to add
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {availableModules.map((module) => (
                <Grid item xs={12} key={module.id}>
                  <Card
                    onClick={() => handleAddModule(module)}
                    sx={{
                      ...cardStyles.default,
                      cursor: 'pointer',
                      p: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius)',
                          backgroundColor: `${module.color}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <module.icon sx={{ color: module.color, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'hsl(var(--text-secondary))' }}>
                          {module.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ModuleView 