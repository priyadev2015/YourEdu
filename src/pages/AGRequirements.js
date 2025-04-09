import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  MenuBook as MenuBookIcon,
  Public as PublicIcon,
  Translate as LanguageIcon,
  Palette as PaletteIcon,
  FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material'


import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

// Import the math requirements image

const subjects = [
  { name: 'History / Social Studies', key: 'history', icon: PublicIcon },
  { name: 'English', key: 'english', icon: MenuBookIcon },
  { name: 'Mathematics', key: 'math', icon: CalculateIcon },
  { name: 'Science', key: 'science', icon: ScienceIcon },
  { name: 'Foreign Language', key: 'language', icon: LanguageIcon },
  { name: 'Visual & Performing Arts', key: 'fineArts', icon: PaletteIcon },
  { name: 'College-Prep Electives', key: 'electives', icon: FitnessCenterIcon },
]

const AGMathDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(215, 30%, 90%)';
  const arrowColor = 'hsl(215, 20%, 40%)';
  const headerBgColor = 'hsl(215, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'math'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(215, 80%, 50%)', // Standard track color from MathTracksTable
    color: 'white',
    border: '1px solid hsl(215, 80%, 50%)',
    '&:hover': {
      backgroundColor: 'hsl(215, 80%, 60%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px',
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
    border: '1px solid hsl(var(--border))',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'algebra-1', name: 'Algebra 1' },
    { id: 'geometry', name: 'Geometry' },
    { id: 'algebra-2', name: 'Algebra 2' },
    { text: 'Not required but highly encouraged', static: true }
  ];

  const popularElectives = [
    { id: 'data-science', name: 'Data Science' },
    { id: 'statistics', name: 'Statistics' },
    { id: 'business-math', name: 'Applied Math' }
  ];

  const equivalentExams = [
    { id: 'precalculus-h', name: 'AP Precalculus' },
    { id: 'ap-calculus-ab', name: 'AP Calculus AB' },
    { id: 'ap-calculus-bc', name: 'AP Calculus BC' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={commonButtonStyles}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(215, 30%, 97%)',
                    color: 'hsl(215, 30%, 30%)',
                    borderColor: 'hsl(215, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(215, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGScienceDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(120, 30%, 90%)';
  const arrowColor = 'hsl(120, 20%, 40%)';
  const headerBgColor = 'hsl(120, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'science'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(120, 80%, 30%)', // Standard track science color
    color: 'white',
    border: '1px solid hsl(120, 80%, 30%)',
    '&:hover': {
      backgroundColor: 'hsl(120, 80%, 30%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px', // Match cardHeight from subject tracks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'biology', name: 'Biology' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'physics', name: 'Physics' },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'astronomy', name: 'Astronomy' },
    { id: 'earth-science', name: 'Earth Science' },
    { id: 'marine-biology', name: 'Marine Biology' }
  ];

  const equivalentExams = [
    { id: 'ap-biology', name: 'AP Biology', fullText: 'AP Biology: Score of 3+' },
    { id: 'ap-chemistry', name: 'AP Chemistry', fullText: 'AP Chemistry: Score of 3+' },
    { id: 'ap-physics', name: 'AP Physics', fullText: 'AP Physics: Score of 3+' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(120, 80%, 30%)',
                      color: 'white',
                      borderColor: 'hsl(120, 80%, 30%)',
                      '&:hover': {
                        backgroundColor: 'hsl(120, 80%, 30%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(120, 30%, 97%)',
                    color: 'hsl(120, 30%, 30%)',
                    borderColor: 'hsl(120, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(120, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGHistoryDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(30, 30%, 90%)';
  const arrowColor = 'hsl(30, 20%, 40%)';
  const headerBgColor = 'hsl(30, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'history'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(45, 80%, 45%)', // Standard track history color
    color: 'white',
    border: '1px solid hsl(45, 80%, 45%)',
    '&:hover': {
      backgroundColor: 'hsl(45, 80%, 45%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px', // Match cardHeight from subject tracks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'government', name: 'Government' },
    { id: 'world-hist', name: 'World History' },
    { id: 'us-hist', name: 'US History' },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'psychology', name: 'Psychology' },
    { id: 'sociology', name: 'Sociology' },
    { id: 'world-religions', name: 'World Religions' }
  ];

  const equivalentExams = [
    { id: 'ap-world', name: 'AP World History', fullText: 'AP World History: Score of 3+' },
    { id: 'ap-us-hist', name: 'AP US History', fullText: 'AP US History: Score of 3+' },
    { id: 'ap-gov', name: 'AP Government', fullText: 'AP Government: Score of 3+' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(45, 80%, 45%)',
                      color: 'white',
                      borderColor: 'hsl(45, 80%, 45%)',
                      '&:hover': {
                        backgroundColor: 'hsl(45, 80%, 45%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(45, 30%, 97%)',
                    color: 'hsl(45, 30%, 30%)',
                    borderColor: 'hsl(45, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(45, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGEnglishDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(180, 30%, 90%)';
  const arrowColor = 'hsl(180, 20%, 40%)';
  const headerBgColor = 'hsl(180, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'english'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(280, 80%, 45%)', // Standard track English color
    color: 'white',
    border: '1px solid hsl(280, 80%, 45%)',
    '&:hover': {
      backgroundColor: 'hsl(280, 80%, 45%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px', // Match cardHeight from subject tracks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'english-9', name: 'English 9' },
    { id: 'english-10', name: 'English 10' },
    { id: 'english-11', name: 'English 11' },
    { id: 'english-12', name: 'English 12' }
  ];

  const popularElectives = [
    { id: 'creative-writing', name: 'Creative Writing' },
    { id: 'journalism', name: 'Journalism' },
    { id: 'public-speaking', name: 'Public Speaking' }
  ];

  const equivalentExams = [
    { id: 'ap-lang', name: 'AP Language', fullText: 'AP Language: Score of 3+' },
    { id: 'ap-lit', name: 'AP Literature', fullText: 'AP Literature: Score of 3+' },
    { id: 'ib-english', name: 'IB English', fullText: 'IB English: Score of 5+' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(280, 80%, 45%)',
                      color: 'white',
                      borderColor: 'hsl(280, 80%, 45%)',
                      '&:hover': {
                        backgroundColor: 'hsl(280, 80%, 45%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(280, 30%, 97%)',
                    color: 'hsl(280, 30%, 30%)',
                    borderColor: 'hsl(280, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(280, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGLanguageDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(270, 30%, 90%)';
  const arrowColor = 'hsl(270, 20%, 40%)';
  const headerBgColor = 'hsl(270, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'language'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(340, 80%, 45%)', // Standard track language color
    color: 'white',
    border: '1px solid hsl(340, 80%, 45%)',
    '&:hover': {
      backgroundColor: 'hsl(340, 80%, 45%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px', // Match cardHeight from subject tracks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'spanish-1', name: 'Spanish 1' },
    { id: 'spanish-2', name: 'Spanish 2' },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'conversation', name: 'Conversation' },
    { id: 'cultural-studies', name: 'Cultural Studies' },
    { id: 'world-lit', name: 'World Literature' }
  ];

  const equivalentExams = [
    { id: 'ap-spanish', name: 'AP Spanish', fullText: 'AP Spanish: Score of 3+' },
    { id: 'ap-french', name: 'AP French', fullText: 'AP French: Score of 3+' },
    { id: 'ap-chinese', name: 'AP Chinese', fullText: 'AP Chinese: Score of 3+' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(340, 80%, 45%)',
                      color: 'white',
                      borderColor: 'hsl(340, 80%, 45%)',
                      '&:hover': {
                        backgroundColor: 'hsl(340, 80%, 45%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(340, 30%, 97%)',
                    color: 'hsl(340, 30%, 30%)',
                    borderColor: 'hsl(340, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(340, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGArtsDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(330, 30%, 90%)';
  const arrowColor = 'hsl(330, 20%, 40%)';
  const headerBgColor = 'hsl(330, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'arts'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(160, 80%, 30%)', // Standard track arts color
    color: 'white',
    border: '1px solid hsl(160, 80%, 30%)',
    '&:hover': {
      backgroundColor: 'hsl(160, 80%, 30%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px', // Match cardHeight from subject tracks
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const straightArrow = {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2rem',
    height: '2px',
    backgroundColor: 'hsl(var(--border))',
    marginLeft: '-1rem',
    marginRight: '-1rem',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '-4px',
      width: '8px',
      height: '8px',
      borderTop: '2px solid hsl(var(--border))',
      borderRight: '2px solid hsl(var(--border))',
      transform: 'rotate(45deg)',
    },
  };

  const courseSequence = [
    { id: 'art-1', name: 'Art 1' },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'ceramics', name: 'Ceramics' },
    { id: 'photography', name: 'Photography' },
    { id: 'digital-art', name: 'Digital Art' }
  ];

  const equivalentExams = [
    { id: 'ap-art-2d', name: 'AP Art 2D', fullText: 'AP Art 2D: Score of 3+' },
    { id: 'ap-art-3d', name: 'AP Art 3D', fullText: 'AP Art 3D: Score of 3+' },
    { id: 'ap-art-draw', name: 'AP Art Drawing', fullText: 'AP Art Drawing: Score of 3+' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(160, 80%, 30%)',
                      color: 'white',
                      borderColor: 'hsl(160, 80%, 30%)',
                      '&:hover': {
                        backgroundColor: 'hsl(160, 80%, 30%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(160, 30%, 97%)',
                    color: 'hsl(160, 30%, 30%)',
                    borderColor: 'hsl(160, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(160, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGElectivesDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(280, 30%, 90%)';
  const arrowColor = 'hsl(280, 20%, 40%)';
  const headerBgColor = 'hsl(280, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'electives'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(280, 80%, 45%)', // Standard track electives color
    color: 'white',
    border: '1px solid hsl(280, 80%, 45%)',
    '&:hover': {
      backgroundColor: 'hsl(280, 80%, 45%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: '#000000',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const courseSequence = [
    { id: 'econ', name: 'Economics' },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'comp-sci', name: 'Computer Science' },
    { id: 'business', name: 'Business' },
    { id: 'psychology', name: 'Psychology' }
  ];

  const equivalentExams = [
    { id: 'ap-comp-sci', name: 'AP Computer Science' },
    { id: 'ap-econ', name: 'AP Economics' },
    { id: 'ap-psych', name: 'AP Psychology' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(280, 80%, 45%)',
                      color: 'white',
                      borderColor: 'hsl(280, 80%, 45%)',
                      '&:hover': {
                        backgroundColor: 'hsl(280, 80%, 45%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(280, 30%, 97%)',
                    color: 'hsl(280, 30%, 30%)',
                    borderColor: 'hsl(280, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(280, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGPEDiagram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardHeight = '60px';
  const cardColor = 'hsl(220, 30%, 90%)';
  const arrowColor = 'hsl(220, 20%, 40%)';
  const headerBgColor = 'hsl(220, 30%, 93%)';

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: 'ag-requirements',
          returnSubject: 'pe'
        }
      });
    }
  };

  const commonButtonStyles = {
    width: '100%',
    height: '60px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 'var(--radius)',
    backgroundColor: 'hsl(220, 80%, 45%)', // Standard track PE color
    color: 'white',
    border: '1px solid hsl(220, 80%, 45%)',
    '&:hover': {
      backgroundColor: 'hsl(220, 80%, 45%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      opacity: 0.9
    },
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: '8px 16px'
  };

  const staticTextStyles = {
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'hsl(var(--muted))',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '8px 16px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    backgroundColor: 'hsl(var(--muted))',
    padding: '12px 16px',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    marginBottom: '1px',
  };

  const yearLabelStyles = {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
  };

  const courseSequence = [
    { id: 'pe-9', name: 'PE 9' },
    { id: 'pe-10', name: 'PE 10' },
    { text: 'Not required', static: true },
    { text: 'Not required', static: true }
  ];

  const popularElectives = [
    { id: 'weight-training', name: 'Weight Training' },
    { id: 'dance', name: 'Dance' },
    { id: 'team-sports', name: 'Team Sports' }
  ];

  const equivalentExams = [
    { id: 'varsity-sports', name: 'Varsity Sports' },
    { id: 'marching-band', name: 'Marching Band' },
    { id: 'cheer', name: 'Cheer' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      {/* Main Track Section */}
      <Box sx={{ 
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <Box sx={sectionHeaderStyles}>
          <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
            Course Sequence
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 1 }}>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={yearLabelStyles}>
                {year}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, py: 1.5 }}>
            {courseSequence.map((course) => (
              <Box key={course.id || course.text}>
                {course.static ? (
                  <Box sx={staticTextStyles}>
                    {course.text}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleCourseClick(course.id)}
                    sx={{
                      ...commonButtonStyles,
                      backgroundColor: 'hsl(220, 30%, 97%)',
                      color: 'hsl(220, 30%, 30%)',
                      borderColor: 'hsl(220, 30%, 70%)',
                      '&:hover': {
                        backgroundColor: 'hsl(220, 30%, 95%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    {course.name}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Additional Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Popular Electives */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Popular Electives
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {popularElectives.map((course) => (
                <Button
                  key={course.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    ...commonButtonStyles,
                    backgroundColor: 'hsl(220, 30%, 97%)',
                    color: 'hsl(220, 30%, 30%)',
                    borderColor: 'hsl(220, 30%, 70%)',
                    '&:hover': {
                      backgroundColor: 'hsl(220, 30%, 95%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {course.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Equivalent Exams */}
        <Box sx={{ 
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          <Box sx={sectionHeaderStyles}>
            <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem' }}>
              Equivalent Exams
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {equivalentExams.map((exam) => (
                <Button
                  key={exam.id}
                  variant="outlined"
                  onClick={() => handleCourseClick(exam.id)}
                  sx={commonButtonStyles}
                >
                  {exam.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AGRequirements = ({ trackType = 'ag-requirements', selectedSubject, setSelectedSubject }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSelectedSubject, setLocalSelectedSubject] = useState(selectedSubject || searchParams.get('subject') || 'history');

  const handleSubjectChange = (newSubject) => {
    setLocalSelectedSubject(newSubject);
    if (setSelectedSubject) {
      setSelectedSubject(newSubject);
    }
    setSearchParams({ tab: trackType, subject: newSubject });
  };

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/course-planning/course/${courseId}`, {
        state: { 
          returnTab: trackType,
          returnSubject: localSelectedSubject
        }
      });
    }
  };

  const renderComingSoonContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        minHeight: '400px',
        width: '100%',
        p: 4
      }}>
        <Typography variant="h5" sx={{ color: 'hsl(var(--foreground))', textAlign: 'center' }}>
          Detailed information on {localSelectedSubject} for the {trackType === 'minimum-track' ? 'minimum' : 'advanced'} track will be coming soon!
        </Typography>
      </Box>
    </Box>
  );

  const renderMathContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Three years required, four years recommended.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Three years of college-preparatory mathematics that include the topics covered in elementary and advanced algebra and two-dimensional and three-dimensional geometry; a fourth year of math is strongly recommended. A geometry course or an integrated math course with a sufficient amount of geometry content must be completed. Approved integrated math courses may be used to fulfill part or all of this requirement. Scoring well on equivalent exams can satisfy part or all of the requirement.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          3 semester units (or 4 quarter units) in elementary algebra, geometry, intermediate algebra or trigonometry, with a grade of C or better, satisfies one year each of the math requirement. A course that has advanced algebra or the equivalent as a prerequisite satisfies two years of the requirement (but not geometry).
        </Typography>
      </Box>
      <AGMathDiagram />
    </Box>
  )

  const renderScienceContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Two years required, three years recommended.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Two years of college-preparatory science, including or integrating topics that provide fundamental knowledge in two of these three subjects: biology, chemistry, or physics. One year of approved interdisciplinary or earth and space sciences coursework can meet one year of the requirement. A third year of science is recommended. Computer Science, Engineering, Applied Science courses can be used in area D as an additional science (i.e., third year and beyond). Scoring well on equivalent exams can satisfy part or all of the requirement.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          For each year of the requirement, a grade of C or better in a transferable course of at least 3 semester (4 quarter) units in a natural (physical or biological) science with at least 30 hours of laboratory (not "demonstration")
        </Typography>
      </Box>
      <AGScienceDiagram />
    </Box>
  )

  const renderHistoryContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Two years of history/social studies required.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One year of U.S. history or half-year of U.S. history and half-year of civics/American government to meet the US History requirement. Additionally, one year of world history, cultures or historical geography (may be a single year long course or two one-semester courses)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Grade of C or better in a transferable course of 3 or more semester (4 or more quarter) units in US History meets the full year of the US History requirement; grade of C or better in a transferable course of 3 or more semester (4 or more quarter) units in civics/American government meets one semester of the US History requirement. Grade of C or better in a transferable course of 3 or more semester (4 or more quarter) units in world history, cultures, or geography meets the World History, Cultures, or Geography requirement.
        </Typography>
      </Box>
      <AGHistoryDiagram />
    </Box>
  )

  const renderEnglishContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Four years of English required.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Four years of college-preparatory English that include frequent writing, from brainstorming to final paper, as well as modern literature. No more than one year of ESL-type courses can be used to meet this requirement.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          For each year required through the 11th grade, a grade of C or better in a non-transferable college course course of 3 or more semester (4 or more quarter) units in English composition, literature (American or English) or foreign literature in translation. Courses used to satisfy the fourth year and/or the entire requirement must be transferable.
        </Typography>
      </Box>
      <AGEnglishDiagram />
    </Box>
  )

  const renderLanguageContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Two years required, three years recommended.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Two years, or equivalent to the 2nd level of high school instruction, of the same language other than English are required. Courses should emphasize speaking and understanding, and include instruction in grammar, vocabulary, reading, composition and culture. American Sign Language and classical languages, such as Latin and Greek, are acceptable, as are Native American languages. Courses taken in the seventh and eighth grades may be used to fulfill part or all of this requirement if the high school accepts them as equivalent to its own courses.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Grade of C or better in any transferable course(s) (excluding conversation) held by the college to be equivalent to two years of high school language. Many colleges list the prerequisites for their second course in language as "Language 1 at this college or two years of high school language." In this case, Language 1 clears both years of the requirement.
        </Typography>
      </Box>
      <AGLanguageDiagram />
    </Box>
  )

  const renderFineArtsContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One year of visual and/or performing arts required.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One yearlong course of visual and performing arts chosen from the following disciplines: dance, music, theater, visual arts or interdisciplinary arts — or two one-semester courses from the same discipline is also acceptable.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Grade of C or better in any transferable course of 3 semester (4 quarter) units that clearly falls within one of four visual/performing arts disciplines: dance, drama/theater, music or visual art
        </Typography>
      </Box>
      <AGArtsDiagram />
    </Box>
  )

  const renderElectivesContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Course Requirements
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One year of college-preparatory electives required.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One year (two semesters) chosen from courses specific to the elective in a course beyond those used to satisfy the requirements of the typical subjects.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Grade of C or better in transferable college courses of at least 3 semester (4 quarter) units in a course beyond those used to satisfy the requirements of the typical subjects.
        </Typography>
      </Box>
      <AGElectivesDiagram />
    </Box>
  )

  const renderPEDContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          High School Courses
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          One year (two semesters) chosen from courses specific to the elective in a course beyond those used to satisfy the requirements of the typical subjects.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: 'hsl(var(--foreground))', fontWeight: 600 }}>
          Community College or University
        </Typography>
        <Typography sx={{ mb: 1, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
          Grade of C or better in transferable college courses of at least 3 semester (4 quarter) units in a course beyond those used to satisfy the requirements of the typical subjects.
        </Typography>
      </Box>
      <AGPEDiagram />
    </Box>
  )

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '600px'
    }}>
      {/* Left Sidebar - Subject Areas */}
      <Box sx={{ 
        width: '300px',
        flexShrink: 0,
        backgroundColor: 'white',
        borderRadius: '8px 0 0 8px',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--muted))'
        }}>
          <Typography sx={{ 
            color: '#000000',
            fontWeight: 600,
            fontSize: '1.125rem'
          }}>
            Subject Areas
          </Typography>
        </Box>
        <List sx={{ px: 2, py: 1.5 }}>
          {subjects.map((subject) => (
            <ListItem
              key={subject.key}
              disablePadding
            >
              <ListItemButton
                selected={localSelectedSubject === subject.key}
                onClick={() => handleSubjectChange(subject.key)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'hsl(var(--brand-primary-light))',
                    '&:hover': {
                      backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ 
                      color: localSelectedSubject === subject.key ? 
                        'hsl(var(--brand-primary))' : 
                        'hsl(var(--foreground))',
                      fontWeight: localSelectedSubject === subject.key ? 600 : 400
                    }}>
                      {subject.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Right Content Area */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          backgroundColor: 'white', 
          borderRadius: '0 8px 8px 0',
          border: '1px solid hsl(var(--border))',
          borderLeft: 'none',
          height: '100%',
          overflow: 'auto'
        }}>
          <Box sx={{ p: 3 }}>
            {trackType !== 'ag-requirements' ? (
              renderComingSoonContent()
            ) : localSelectedSubject === 'math' ? (
              renderMathContent()
            ) : localSelectedSubject === 'science' ? (
              renderScienceContent()
            ) : localSelectedSubject === 'history' ? (
              renderHistoryContent()
            ) : localSelectedSubject === 'english' ? (
              renderEnglishContent()
            ) : localSelectedSubject === 'language' ? (
              renderLanguageContent()
            ) : localSelectedSubject === 'fineArts' ? (
              renderFineArtsContent()
            ) : localSelectedSubject === 'electives' ? (
              renderElectivesContent()
            ) : localSelectedSubject === 'pe' ? (
              renderPEDContent()
            ) : (
              <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                Content for this subject will be added here.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AGRequirements;