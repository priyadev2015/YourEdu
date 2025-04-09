import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Box, Container, Paper, Grid, Tab, Tabs, Button, Stack, FormControl, Select, MenuItem, Typography } from '@mui/material'
import { School as SchoolIcon, LocationOn as LocationIcon } from '@mui/icons-material'
import { BodyText } from '../components/ui/typography'
import { toast } from 'react-hot-toast'

import FourYearPlan from './4yearplan'
import AGRequirements from './AGRequirements'
import { supabase } from '../utils/supabaseClient'
import SubjectTracks from '../components/SubjectTracks/SubjectTracks'

// Move styles object before the component definition
const styles = {
  tracksTable: {
    width: '100%',
    minWidth: '800px',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: 'var(--radius)',
    tableLayout: 'fixed',
    border: '1px solid hsl(var(--border))',
  },
  tableHeader: {
    padding: 'clamp(12px, 2vw, 24px)',
    textAlign: 'left',
    backgroundColor: 'hsl(var(--muted))',
    color: 'hsl(var(--foreground))',
    fontWeight: 600,
    fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
    border: '1px solid hsl(var(--border))',
    borderBottom: '2px solid hsl(var(--border))',
    '&:first-of-type': {
      borderTopLeftRadius: 'var(--radius)',
    },
    '&:last-child': {
      borderTopRightRadius: 'var(--radius)',
    },
  },
  trackNameCell: {
    padding: 'clamp(12px, 2vw, 24px)',
    backgroundColor: 'hsl(var(--muted))',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
    width: 'clamp(180px, 25vw, 220px)',
  },
  courseCell: {
    padding: 'clamp(8px, 2vw, 16px)',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
    minWidth: 'clamp(120px, 18vw, 200px)',
    maxWidth: '100%',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
    },
  },
  englishCourseCell: {
    padding: '16px',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
      transform: 'translateY(-2px)',
    },
  },
  literatureIcon: {
    fontSize: '1.2rem',
    color: 'hsl(var(--brand-primary))',
    marginRight: '8px',
  },
  courseTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: 'hsl(var(--brand-primary-light))',
    color: 'hsl(var(--brand-primary))',
    marginTop: '4px',
  },
  courseArrowContainer: {
    position: 'absolute',
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '2px',
    zIndex: 1,
  },
  trackContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1, sm: 1.5 },
    padding: { xs: 1, sm: 1.5 },
    minWidth: 0,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 400px)',
    width: '100%',
  },
  courseChain: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1, sm: 1.5 },
    minWidth: 0,
  },
  chainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.5, sm: 1 },
    position: 'relative',
    paddingLeft: { xs: 0.5, sm: 1 },
    minWidth: 0,
  },
  courseBox: {
    backgroundColor: 'hsl(var(--card))',
    border: '2px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    width: { xs: '100%', sm: 'auto' },
    maxWidth: { xs: '100%', sm: '200px' },
    minWidth: { xs: 0, sm: '150px' },
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    '& span': {
      width: '100%',
      textAlign: 'center',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      backgroundColor: 'hsl(var(--accent))',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderColor: 'hsl(var(--accent-foreground))',
    },
  },
  arrow: {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4rem',
    height: '2px',
    backgroundColor: 'hsl(var(--foreground))',
    marginLeft: '-2rem',
    marginRight: '-2rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--foreground))',
      borderRight: '2px solid hsl(var(--foreground))',
      transform: 'rotate(45deg)',
    },
  },
  trackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  trackBadge: {
    backgroundColor: 'hsl(var(--brand-primary-light))',
    color: 'hsl(var(--brand-primary))',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
    fontWeight: 500,
  },
  yearHeaders: {
    display: 'grid',
    gridTemplateColumns: '10rem repeat(5, 1fr)',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--muted))',
    padding: '0 1rem',
    gap: '0',
  },
  yearHeader: {
    fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    padding: '1rem 0',
    position: 'relative',
    width: '100%',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '2px',
      backgroundColor: 'hsl(var(--brand-primary))',
    },
  },
  trackRow: {
    display: 'grid',
    gridTemplateColumns: '10rem repeat(5, 1fr)',
    alignItems: 'center',
    padding: '1.5rem 1rem',
    borderBottom: '1px solid hsl(var(--border))',
    gap: '0',
    width: '100%',
    '& > *': {
      display: 'flex',
      justifyContent: 'center',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  trackLabel: {
    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    width: '100%',
    '& span': {},
  },
  courseChainCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    width: '100%',
    padding: '0 2rem',
  },
  sequenceContainer: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  sequenceHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--muted))',
  },
  flexibleArrow: {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4rem',
    height: '2px',
    backgroundColor: 'hsl(var(--foreground))',
    marginLeft: '-2rem',
    marginRight: '-2rem',
    zIndex: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--foreground))',
      borderLeft: '2px solid hsl(var(--foreground))',
      transform: 'rotate(-45deg)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--foreground))',
      borderRight: '2px solid hsl(var(--foreground))',
      transform: 'rotate(45deg)',
    },
  },
  electivesCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '250px',
  },
  electiveArrowContainer: {
    position: 'absolute',
    left: '-2rem',
    width: '2rem',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  divergingArrow: {
    position: 'absolute',
    width: '4rem',
    height: '2px',
    backgroundColor: 'hsl(var(--foreground))',
    transformOrigin: '-2rem 50%',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--foreground))',
      borderRight: '2px solid hsl(var(--foreground))',
      transform: 'rotate(45deg)',
    },
  },
  sectionHeaderText: {},
  supportingText: {},
}

// Swap Advanced and Average color schemes
const trackColors = {
  Advanced: {
    background: 'hsl(var(--brand-primary-light))',
    border: 'hsl(var(--brand-primary))',
  },
  Average: {
    background: 'hsl(var(--brand-primary-light) / 0.6)', // 40% darker
    border: 'hsl(var(--brand-primary) / 0.6)', // 40% darker
  },
  Minimum: {
    background: 'hsl(var(--muted))',
    border: 'hsl(var(--muted-foreground))',
  },
}

// Add the getCollegeLogo function from Colleges.js
const getCollegeLogo = (schoolName) => {
  try {
    // List of schools that need larger logos with their size multipliers
    const largerLogoSchools = {
      'Brown University': 2,
      'Emory University': 1.7,
      'Lehigh University': 1.7,
      'University of California, Berkeley': 1.7,
      'University of Wisconsin, Madison': 1.7,
      'Yale University': 1.7,
      'Boston University': 1.35,
    }

    const logo = require(`../assets/College Logos/${schoolName}.png`)

    // Return the logo with a size multiplier if it's one of the specified schools
    return {
      src: logo,
      sizeMultiplier: largerLogoSchools[schoolName] || 1,
    }
  } catch (e) {
    return null
  }
}

// Add state abbreviations mapping
const stateAbbreviations = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI',
  'Wyoming': 'WY'
};

const reverseStateAbbreviations = Object.entries(stateAbbreviations).reduce((acc, [name, abbr]) => {
  acc[abbr] = name;
  return acc;
}, {});

// Update the CollegeSpecificPlanning component
const CollegeSpecificPlanning = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myColleges, setMyColleges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyColleges = async () => {
      if (!user?.id) return

      try {
        // First, fetch the user's college list
        const { data: collegeList, error: collegeListError } = await supabase
          .from('user_college_list')
          .select('college_name, early_action, early_decision, regular_decision')
          .eq('user_id', user.id)

        if (collegeListError) throw collegeListError

        // If we have colleges, fetch their requirements
        if (collegeList?.length > 0) {
          const collegePromises = collegeList.map(async (college) => {
            const { data: collegeData, error: collegeError } = await supabase
              .from('colleges')
              .select(
                `
                School,
                "AP/Advanced Courses",
                "Course Descriptions",
                "Additional Requirement",
                "ACT/SAT",
                "Secondary School Report",
                LoRs,
                Transcript
              `
              )
              .eq('School', college.college_name)
              .single()

            if (collegeError) {
              console.warn(`Error fetching data for ${college.college_name}:`, collegeError)
              return {
                name: college.college_name,
                deadlines: {
                  earlyAction: college.early_action,
                  earlyDecision: college.early_decision,
                  regularDecision: college.regular_decision,
                },
                requirements: null,
              }
            }

            return {
              name: college.college_name,
              deadlines: {
                earlyAction: college.early_action,
                earlyDecision: college.early_decision,
                regularDecision: college.regular_decision,
              },
              requirements: collegeData,
            }
          })

          const results = await Promise.all(collegePromises)
          setMyColleges(results)
        } else {
          setMyColleges([])
        }
      } catch (error) {
        console.error('Error fetching college data:', error)
        setMyColleges([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyColleges()
  }, [user?.id])

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* Add descriptive section at the top */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            }}
          >
            College-Specific Course Planning
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/college')}
            sx={{
              backgroundColor: 'hsl(var(--brand-primary))',
              color: 'white',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-dark))',
              },
            }}
          >
            Explore Colleges
          </Button>
        </Box>
        <Typography
          sx={{
            mb: 3,
            color: 'hsl(var(--muted-foreground))',
            fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
            lineHeight: 1.6,
          }}
        >
          This section helps you align your course selections with the specific requirements and recommendations of your
          chosen colleges. By understanding each college's academic expectations, you can better plan your coursework to
          strengthen your application and increase your chances of admission.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading your college requirements...</Typography>
        </Box>
      ) : myColleges.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>You haven't added any colleges to your list yet.</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/colleges')}
            sx={{
              backgroundColor: 'hsl(var(--brand-primary))',
              color: 'white',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-dark))',
              },
            }}
          >
            Go to Colleges Page
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {myColleges.map((college) => (
            <Grid item xs={12} md={6} key={college.name}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  {getCollegeLogo(college.name) ? (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={getCollegeLogo(college.name).src}
                        alt={`${college.name} logo`}
                        style={{
                          width: `${getCollegeLogo(college.name).sizeMultiplier * 100}%`,
                          height: `${getCollegeLogo(college.name).sizeMultiplier * 100}%`,
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                  ) : (
                    <SchoolIcon
                      sx={{
                        fontSize: 40,
                        color: 'hsl(var(--brand-primary))',
                      }}
                    />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'hsl(var(--foreground))',
                      fontWeight: 600,
                      flex: 1,
                    }}
                  >
                    {college.name}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {college.requirements?.['AP/Advanced Courses'] && (
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1, color: 'hsl(var(--foreground))' }}>
                        AP/Advanced Courses
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {college.requirements['AP/Advanced Courses']}
                      </Typography>
                    </Box>
                  )}

                  {college.requirements?.['Course Descriptions'] && (
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1, color: 'hsl(var(--foreground))' }}>
                        Course Requirements
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {college.requirements['Course Descriptions']}
                      </Typography>
                    </Box>
                  )}

                  {college.requirements?.['Additional Requirement'] && (
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1, color: 'hsl(var(--foreground))' }}>
                        Additional Requirements
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {college.requirements['Additional Requirement']}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 1, color: 'hsl(var(--foreground))' }}>
                      Application Deadlines
                    </Typography>
                    <Stack spacing={1}>
                      {college.deadlines.earlyAction && (
                        <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Early Action: {new Date(college.deadlines.earlyAction).toLocaleDateString()}
                        </Typography>
                      )}
                      {college.deadlines.earlyDecision && (
                        <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Early Decision: {new Date(college.deadlines.earlyDecision).toLocaleDateString()}
                        </Typography>
                      )}
                      {college.deadlines.regularDecision && (
                        <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Regular Decision: {new Date(college.deadlines.regularDecision).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

// The main Course Planning page
const CoursePlanning = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('selectedStudent')
    return saved ? JSON.parse(saved) : null
  })

  // Get tab and subtab from URL or defaults
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'new-four')
  const [expandedSubject, setExpandedSubject] = useState(searchParams.get('subject') || 'math')

  // Listen for student changes from Navbar
  useEffect(() => {
    const handleStudentChange = (event) => {
      setSelectedStudent(event.detail)
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => window.removeEventListener('studentChanged', handleStudentChange)
  }, [])

  // Update URL when tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    if (newValue === 'tracks' || newValue === 'ag-requirements') {
      setSearchParams({ tab: newValue, subject: expandedSubject })
    } else {
      setSearchParams({ tab: newValue })
    }
  }

  // Update URL when subject changes
  const handleSubjectChange = (newSubject) => {
    setExpandedSubject(newSubject)
    setSearchParams({ tab: activeTab, subject: newSubject })
  }

  // Handle course click
  const handleCourseClick = (event, course) => {
    event.preventDefault()
    event.stopPropagation()

    console.log('handleCourseClick called with:', course)

    // Store the course name in localStorage
    localStorage.setItem('currentCourseName', course.title || course.name || 'Course')

    // Navigate to course detail page with the current tab and subject state
    navigate(`/course-planning/course/${course.id}`, {
      state: {
        returnTab: activeTab,
        returnSubject: expandedSubject,
      },
    })
  }

  const [userState, setUserState] = useState('CA') // Default to CA
  const [availableStates] = useState(['CA']) // Currently only California has data

  // Get the full state name for the dropdown
  const currentStateFullName = userState ? reverseStateAbbreviations[userState] : '';

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleStateChange = (event) => {
    const fullStateName = event.target.value;
    const stateAbbr = stateAbbreviations[fullStateName];
    
    // Only allow changing to states that have data
    if (!availableStates.includes(stateAbbr)) {
      toast.warning('Course planning information for this state is coming soon!');
      return;
    }
    
    setUserState(stateAbbr);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100%',
        backgroundColor: 'hsl(var(--background))',
        overflow: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 3
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
              pl: 2.1,
              lineHeight: 1.5,
              '& .bold': {
                fontWeight: 600
              }
            }}
          >
            View your state's specific course requirements and standards for high school. The <span className="bold">minimum track</span> is based on the state's minimum high school graduation requirements. The <span className="bold">standard track</span> is based on the state's flagship university's freshman applicant requirements. The <span className="bold">advanced track</span> is based on the state's top performing public high school's advanced track for a given subject.
          </Typography>
        </Container>
      </Box>

      {/* State Selection Section */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          mb: 3,
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {!loading && (
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              mb: 3
            }}
          >
            <LocationIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BodyText>Currently viewing course planning information for</BodyText>
              <FormControl size="small">
                <Select
                  value={currentStateFullName}
                  onChange={handleStateChange}
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'hsl(var(--brand-primary))',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'hsl(var(--brand-primary))',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'hsl(var(--brand-primary))',
                    },
                  }}
                >
                  {states.map((state) => (
                    <MenuItem 
                      key={state} 
                      value={state}
                      disabled={!availableStates.includes(stateAbbreviations[state])}
                    >
                      {state}
                      {!availableStates.includes(stateAbbreviations[state]) && 
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          (Coming Soon)
                        </Typography>
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}
      </Container>

      {/* Tabs Section */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'hsl(var(--background))',
          borderBottom: 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Container 
          maxWidth="var(--container-max-width)"
          sx={{ 
            px: { xs: 1, sm: 'var(--spacing-8)' },
            '@media (--tablet)': {
              px: 'var(--spacing-4)',
            },
            overflow: 'auto'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'hsl(var(--brand-primary))',
              },
              minHeight: { xs: '40px', sm: 'auto' },
            }}
          >
            <Tab
              label="High School Planner"
              value="new-four"
              disableRipple
              sx={{
                color: 'hsl(var(--text-secondary))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
                '&:hover': {
                  color: 'hsl(var(--text-secondary))',
                  backgroundColor: 'transparent',
                },
                '&.Mui-selected:hover': {
                  color: 'hsl(var(--brand-primary))',
                  backgroundColor: 'transparent',
                },
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
                minHeight: { xs: '40px', sm: 'auto' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            />
            <Tab
              label="Subject Tracks Comparison"
              value="tracks"
              disableRipple
              sx={{
                color: 'hsl(var(--text-secondary))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
                '&:hover': {
                  color: 'hsl(var(--text-secondary))',
                  backgroundColor: 'transparent',
                },
                '&.Mui-selected:hover': {
                  color: 'hsl(var(--brand-primary))',
                  backgroundColor: 'transparent',
                },
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
                minHeight: { xs: '40px', sm: 'auto' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            />
            <Tab
              label="Explore Minimum Track"
              value="minimum-track"
              disableRipple
              sx={{
                color: 'hsl(var(--text-secondary))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
                '&:hover': {
                  color: 'hsl(var(--text-secondary))',
                  backgroundColor: 'transparent',
                },
                '&.Mui-selected:hover': {
                  color: 'hsl(var(--brand-primary))',
                  backgroundColor: 'transparent',
                },
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
                minHeight: { xs: '40px', sm: 'auto' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            />
            <Tab
              label="Explore Standard Track"
              value="ag-requirements"
              disableRipple
              sx={{
                color: 'hsl(var(--text-secondary))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
                '&:hover': {
                  color: 'hsl(var(--text-secondary))',
                  backgroundColor: 'transparent',
                },
                '&.Mui-selected:hover': {
                  color: 'hsl(var(--brand-primary))',
                  backgroundColor: 'transparent',
                },
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
                minHeight: { xs: '40px', sm: 'auto' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            />
            <Tab
              label="Explore Advanced Track"
              value="advanced-track"
              disableRipple
              sx={{
                color: 'hsl(var(--text-secondary))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
                '&:hover': {
                  color: 'hsl(var(--text-secondary))',
                  backgroundColor: 'transparent',
                },
                '&.Mui-selected:hover': {
                  color: 'hsl(var(--brand-primary))',
                  backgroundColor: 'transparent',
                },
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
                minHeight: { xs: '40px', sm: 'auto' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: { xs: 2, sm: 'var(--container-padding-x)' },
          py: { xs: 2, sm: 'var(--spacing-6)' },
          height: { xs: 'auto', md: 'calc(100vh - 200px)' }, // Auto height on mobile, fixed on desktop
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            overflow: 'auto', // Allow scrolling
          }}
        >
          {activeTab === 'tracks' && (
            <Box
              sx={{
                height: '100%',
                overflow: 'auto', // Allow scrolling
              }}
            >
              <SubjectTracks
                expandedSubject={expandedSubject}
                setExpandedSubject={handleSubjectChange}
                handleCourseClick={handleCourseClick}
              />
            </Box>
          )}
          {(activeTab === 'ag-requirements' || activeTab === 'minimum-track' || activeTab === 'advanced-track') && (
            <Box sx={{ display: 'flex', height: '100%', overflow: 'auto' }}> {/* Allow scrolling */}
              <AGRequirements 
                trackType={activeTab}
                selectedSubject={expandedSubject}
                setSelectedSubject={handleSubjectChange}
              />
            </Box>
          )}
          {activeTab === 'new-four' && (
            <Box sx={{ 
              height: '100%', 
              overflow: 'auto', // Allow scrolling
              width: '100%'
            }}>
              <FourYearPlan />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default CoursePlanning
