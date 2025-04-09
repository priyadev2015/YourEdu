import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import withAuthCheck from '../utils/withAuthCheck'
import { StudentService } from '../services/StudentService'
import { isFeatureVisible } from '../App'
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Collapse,
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


import {
  BsEyeSlash,
} from 'react-icons/bs'
import { BodyText } from './ui/typography'


import { FaUserGraduate } from 'react-icons/fa'
import { 
  FaBuildingColumns, 
  FaHouseChimney, 
  FaIdCard, 
  FaChildReaching,
  FaPiggyBank,
  FaChalkboardUser,
  FaMapLocationDot,
  FaGraduationCap,
  FaBook,
  FaFolderOpen,
  FaCalendarCheck,
  FaFileLines,
} from 'react-icons/fa6'

const ComplianceIcon = ({ style }) => (
  <FaBuildingColumns style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

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

const StudentsIcon = ({ style }) => (
  <FaChildReaching style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const PerksIcon = ({ style }) => (
  <FaPiggyBank style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px'
  }} />
)

const StudentToggleIcon = ({ style }) => (
  <FaUserGraduate style={{ 
    ...style, 
    fontSize: style?.fontSize || '22px', 
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    lineHeight: '22px',
    marginTop: '-2px',
    marginRight: '4px'
  }} />
)

const RecordKeepingIcon = ({ style }) => (
  <FaFolderOpen style={{ 
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

const Navbar = ({ handleInteraction }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const userType = localStorage.getItem('userType') || 'highschool'
  const [openSections, setOpenSections] = useState({})
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  const [targetPath, setTargetPath] = useState('')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  // Add state for collapsed navbar
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

  const fetchStudents = async () => {
    if (user) {
      try {
        const studentsList = await StudentService.getStudentsByParentId(user.id)
        setStudents(studentsList)
        
        // Set selected student from localStorage or first student
        const savedStudent = localStorage.getItem('selectedStudent')
        if (savedStudent) {
          const parsed = JSON.parse(savedStudent)
          const exists = studentsList.find(s => s.id === parsed.id)
          if (exists) {
            setSelectedStudent(exists)
          } else if (studentsList.length > 0) {
            setSelectedStudent(studentsList[0])
            localStorage.setItem('selectedStudent', JSON.stringify(studentsList[0]))
          }
        } else if (studentsList.length > 0) {
          setSelectedStudent(studentsList[0])
          localStorage.setItem('selectedStudent', JSON.stringify(studentsList[0]))
        }
      } catch (err) {
        console.error('Error fetching students:', err)
      }
      setLoading(false)
    }
  }

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents()
  }, [user])

  // Listen for studentAdded event
  useEffect(() => {
    const handleStudentAdded = (event) => {
      const newStudent = event.detail
      setStudents(prev => {
        const updated = [...prev, newStudent]
        // If no student is selected, select the new one
        if (!selectedStudent) {
          setSelectedStudent(newStudent)
          localStorage.setItem('selectedStudent', JSON.stringify(newStudent))
        }
        return updated
      })
    }

    window.addEventListener('studentAdded', handleStudentAdded)
    return () => window.removeEventListener('studentAdded', handleStudentAdded)
  }, [selectedStudent])

  // Listen for studentChanged event
  useEffect(() => {
    const handleStudentChanged = (event) => {
      console.log('Navbar received studentChanged event:', event.detail)
      const changedStudent = event.detail
      
      // Find the complete student in our list if possible
      const studentInList = students.find(s => s.id === changedStudent.id)
      
      // Use the student from our list if available, otherwise use the one from the event
      const studentToUse = studentInList || changedStudent
      
      // Update the selected student
      setSelectedStudent(studentToUse)
    }

    window.addEventListener('studentChanged', handleStudentChanged)
    return () => window.removeEventListener('studentChanged', handleStudentChanged)
  }, [students])

  // Update localStorage when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      localStorage.setItem('selectedStudent', JSON.stringify(selectedStudent))
    }
  }, [selectedStudent])

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

  const parentNavSections = [
    {
      id: 'compliance',
      label: 'Compliance',
      icon: ComplianceIcon,
      to: '/compliance',
    },
  ]

  // Removing Course Planning tab
  const studentNavSections = []

  const handleLogout = async (e) => {
    handleInteraction(e, async () => {
      try {
        console.log('Logging out user from Navbar...')
        const logoutSuccess = await logout()
        
        // The logout function now handles navigation, but we'll add a fallback
        if (logoutSuccess) {
          console.log('Logout successful, navigation handled by AuthContext')
        } else {
          console.log('Fallback navigation to login page')
          navigate('/login-selection')
        }
      } catch (error) {
        console.error('Error during logout from Navbar:', error)
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
        data-navbar-type="parent"
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
            {(userType === 'highschool' || userType === 'parent') && (
              <>
                {/* Admin nav sections */}
                {parentNavSections.map((section) => (
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

                {/* Student Section Header - Commented out */}
                <Divider sx={{ my: 2, borderColor: 'hsl(var(--border))' }} />
                {/* Student toggle section removed */}

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
              </>
            )}

            {/* Logout button at the bottom */}
            <Box sx={{ mt: 'auto', px: 'var(--spacing-2)', pb: 'var(--spacing-4)' }}>
              <Divider sx={{ my: 2, borderColor: 'hsl(var(--border))' }} />
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

export default withAuthCheck(Navbar)

