import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import withAuthCheck from '../utils/withAuthCheck'
import { isFeatureVisible } from '../App'
import {
  Box,
  List,
  ListItem,
  Collapse,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { BodyText } from './ui/typography'

import {
  BsEyeSlash,
} from 'react-icons/bs'

import { 
  FaHouseChimney, 
  FaIdCard, 
  FaChalkboardUser,
  FaMapLocationDot,
  FaGraduationCap,
  FaBook,
  FaFileLines,
  FaCalendarCheck,
  FaBriefcase,
} from 'react-icons/fa6'

const HomeIcon = ({ style }) => (
  <FaHouseChimney style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const MembershipIcon = ({ style }) => (
  <FaIdCard style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const CoursesIcon = ({ style }) => (
  <FaChalkboardUser style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const CoursePlanningIcon = ({ style }) => (
  <FaMapLocationDot style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const TranscriptIcon = ({ style }) => (
  <FaFileLines style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const CourseDescriptionsIcon = ({ style }) => (
  <FaBook style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const AttendanceIcon = ({ style }) => (
  <FaCalendarCheck style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const CollegeIcon = ({ style }) => (
  <FaGraduationCap style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const CareerIcon = ({ style }) => (
  <FaBriefcase style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const NavItem = ({ icon: Icon, label, to, isActive, onClick, hasChildren, isOpen, handleInteraction, isCollapsed }) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    if (to) {
      handleInteraction(e, () => navigate(to))
    } else if (onClick) {
      handleInteraction(e, onClick)
    }
  }

  const content = (
    <Box
      sx={{
        cursor: 'pointer',
        backgroundColor: isActive ? 'hsl(var(--brand-primary-light))' : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? 'hsl(var(--brand-primary-light))' : 'hsla(var(--brand-primary), 0.04)',
        },
        transition: 'background-color 0.2s',
        borderRadius: 'var(--radius-sm)',
        mx: 1,
      }}
      onClick={handleClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : 'var(--spacing-2)',
          px: isCollapsed ? 'var(--spacing-2)' : 'var(--spacing-3)',
          py: 'var(--spacing-2)',
          color: 'hsl(var(--text-primary))',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        {Icon && <Icon style={{ fontSize: isCollapsed ? 26 : 22, color: 'hsl(var(--text-primary))' }} />}
        {!isCollapsed && (
          <BodyText
            sx={{
              color: 'hsl(var(--text-primary))',
              fontWeight: isActive ? 600 : 400,
              fontSize: '1rem',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </BodyText>
        )}
        {!isCollapsed && hasChildren && (
          <Box sx={{ ml: 'auto', color: 'inherit' }}>{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</Box>
        )}
      </Box>
    </Box>
  )

  return isCollapsed ? (
    <Tooltip title={label} placement="right" arrow>
      {content}
    </Tooltip>
  ) : content
}

const NavSection = ({ section, isActive, toggleSection, openSections, handleInteraction, isCollapsed }) => {
  const isOpen = openSections[section.id] === true

  if (section.children) {
    return (
      <Box>
        <Box
          onClick={(e) => handleInteraction(e, () => toggleSection(section.id))}
          sx={{
            cursor: 'pointer',
            backgroundColor: isActive(section.to) ? 'hsl(var(--brand-primary-light))' : 'transparent',
            '&:hover': {
              backgroundColor: isActive(section.to) ? 'hsl(var(--brand-primary-light))' : 'hsla(var(--brand-primary), 0.04)',
            },
            transition: 'background-color 0.2s',
            borderRadius: 'var(--radius-sm)',
            mx: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? 0 : 'var(--spacing-3)',
              px: isCollapsed ? 'var(--spacing-2)' : 'var(--spacing-4)',
              py: 'var(--spacing-2)',
              color: 'hsl(var(--text-primary))',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            {section.icon && <section.icon style={{ fontSize: isCollapsed ? 26 : 22, color: 'hsl(var(--text-primary))' }} />}
            {!isCollapsed && (
              <>
                <BodyText
                  sx={{
                    color: 'hsl(var(--text-primary))',
                    fontWeight: isActive(section.to) ? 600 : 400,
                    fontSize: '1.1rem',
                  }}
                >
                  {section.label}
                </BodyText>
                <Box sx={{ ml: 'auto', color: 'inherit' }}>{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</Box>
              </>
            )}
          </Box>
        </Box>

        {!isCollapsed && (
          <Collapse in={isOpen}>
            <List
              sx={{
                pl: 'var(--spacing-4)',
                '& .MuiListItem-root': {
                  p: 0,
                },
              }}
            >
              {section.children.map((child) => (
                <ListItem key={child.id} disablePadding>
                  {child.children ? (
                    <NavSection
                      section={child}
                      isActive={isActive}
                      toggleSection={toggleSection}
                      openSections={openSections}
                      handleInteraction={handleInteraction}
                      isCollapsed={isCollapsed}
                    />
                  ) : (
                    <NavItem 
                      icon={child.icon} 
                      label={child.label} 
                      to={child.to} 
                      isActive={isActive(child.to)}
                      handleInteraction={handleInteraction}
                      isCollapsed={isCollapsed}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  return (
    <NavItem 
      icon={section.icon} 
      label={section.label} 
      to={section.to} 
      isActive={isActive(section.to)}
      handleInteraction={handleInteraction}
      isCollapsed={isCollapsed}
    />
  )
}

const NavbarStudent = ({ handleInteraction }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [openSections, setOpenSections] = useState({})
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isDevEnvironment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  // Use the new isFeatureVisible function for feature visibility
  const shouldShowFeature = isFeatureVisible()

  // Toggle navbar collapse state
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // Save preference to localStorage
    localStorage.setItem('navbarCollapsed', newState.toString())
    
    // Dispatch custom event for App.js to listen to
    window.dispatchEvent(
      new CustomEvent('navbarToggled', { 
        detail: { isCollapsed: newState } 
      })
    )
  }

  // Load collapse preference from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('navbarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const isActive = (path) => {
    if (!path) return false
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const studentNavSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: HomeIcon,
      to: '/parent-academics',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      to: '/dashboard',
    },
    {
      id: 'membershipId',
      label: 'Membership ID',
      icon: MembershipIcon,
      to: '/id-generation/view',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: AttendanceIcon,
      to: '/attendance',
    },
    {
      id: 'myCourses',
      label: 'Course Pages',
      icon: CoursesIcon,
      to: '/my-courses',
    },
    {
      id: 'coursePlanning',
      label: 'Course Planning',
      icon: CoursePlanningIcon,
      to: '/course-planning',
    },
    {
      id: 'transcript',
      label: 'Transcript',
      icon: TranscriptIcon,
      to: '/transcript',
    },
    {
      id: 'courseDescriptions',
      label: 'Course Descriptions',
      icon: CourseDescriptionsIcon,
      to: '/course-description',
    },
    {
      id: 'college',
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          College
          {shouldShowFeature && <BsEyeSlash style={{ fontSize: '14px', opacity: 0.7 }} />}
        </Box>
      ),
      icon: CollegeIcon,
      to: '/common-app-landing',
    },
    {
      id: 'career',
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Career
          {shouldShowFeature && <BsEyeSlash style={{ fontSize: '14px', opacity: 0.7 }} />}
        </Box>
      ),
      icon: CareerIcon,
      to: '/careers',
    },
  ]

  const handleLogout = async (e) => {
    handleInteraction(e, async () => {
      try {
        console.log('Logging out user from NavbarStudent...')
        const logoutSuccess = await logout()
        
        // The logout function now handles navigation, but we'll add a fallback
        if (logoutSuccess) {
          console.log('Logout successful, navigation handled by AuthContext')
        } else {
          console.log('Fallback navigation to login page')
          navigate('/login-selection')
        }
      } catch (error) {
        console.error('Error during logout from NavbarStudent:', error)
        // Fallback navigation in case of error
        navigate('/login-selection')
      }
    })
  }

  return (
    <>
      {/* Floating collapse toggle button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 80, // Position it above the logout button
          left: isCollapsed ? 60 : 228,
          zIndex: 10000,
          transition: 'left 0.3s ease',
          filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
        }}
      >
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid',
              borderColor: 'white',
              boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-light))',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={toggleCollapse}
          >
            {isCollapsed ? 
              <ChevronRightIcon sx={{ fontSize: 20, color: 'hsl(var(--brand-primary))' }} /> : 
              <ChevronLeftIcon sx={{ fontSize: 20, color: 'hsl(var(--brand-primary))' }} />
            }
          </Box>
      </Box>

      <Box
        data-navbar-type="student"
        sx={{
          width: isCollapsed ? 72 : 240,
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          top: 64,
          bottom: 0,
          overflowY: 'auto',
          bgcolor: 'white',
          borderRight: '1px solid',
          borderColor: 'hsl(var(--border))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
        }}
      >
        <Box
          sx={{
            flex: 1,
            py: 'var(--spacing-2)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List
            sx={{
              p: 0,
              pt: '25px',
              '& .MuiListItem-root': {
                display: 'block',
                p: 0,
              },
              '& .MuiListItemButton-root': {
                py: 'var(--spacing-2)',
                px: 'var(--spacing-4)',
              },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Student nav sections */}
            {studentNavSections.map((section) => (
              <ListItem key={section.id} sx={{ mb: 'var(--spacing-1)' }}>
                <NavSection
                  section={section}
                  isActive={isActive}
                  toggleSection={toggleSection}
                  openSections={openSections}
                  handleInteraction={handleInteraction}
                  isCollapsed={isCollapsed}
                />
              </ListItem>
            ))}

            {/* Logout button at the bottom */}
            <Box sx={{ mt: 'auto', px: 'var(--spacing-2)', pb: 'var(--spacing-4)' }}>
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'hsl(var(--border))',
                  my: 2,
                }}
              />
              <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
                <Box
                  onClick={handleLogout}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                    },
                    transition: 'background-color 0.2s',
                    borderRadius: 'var(--radius-sm)',
                    mx: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCollapsed ? 0 : 'var(--spacing-2)',
                      px: isCollapsed ? 'var(--spacing-2)' : 'var(--spacing-3)',
                      py: 'var(--spacing-2)',
                      color: 'hsl(var(--text-primary))',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <LogoutIcon style={{ fontSize: isCollapsed ? 26 : 22, color: 'hsl(var(--text-primary))' }} />
                    {!isCollapsed && (
                      <BodyText
                        sx={{
                          color: 'hsl(var(--text-primary))',
                          fontWeight: 400,
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Logout
                      </BodyText>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            </Box>
          </List>
        </Box>
      </Box>
    </>
  )
}

export default withAuthCheck(NavbarStudent) 