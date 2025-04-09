import React from 'react';
import { Box, Button } from '@mui/material';

const EnglishTracksTable = ({ handleCourseClick: parentHandleClick }) => {
  const cardHeight = '60px';
  
  const electives = [
    { id: 'creative-writing', name: 'Creative Writing' },
    { id: 'journalism', name: 'Journalism' },
    { id: 'public-speaking', name: 'Public Speaking' },
    { id: 'debate', name: 'Debate' }
  ];
  
  const tracks = [
    {
      name: 'Advanced',
      courses: [
        { id: 'english-9-h', name: 'English 9 Honors', year: 1 },
        { id: 'english-10-h', name: 'English 10 Honors', year: 2 },
        { id: 'ap-lang', name: 'AP English Language', year: 3 },
        { id: 'ap-lit', name: 'AP English Literature', year: 4 }
      ],
      color: 'hsl(280, 100%, 25%)' // Dark purple
    },
    {
      name: 'Standard',
      courses: [
        { id: 'english-9', name: 'English 9', year: 1 },
        { id: 'english-10', name: 'English 10', year: 2 },
        { id: 'english-11', name: 'English 11', year: 3 },
        { id: 'english-12', name: 'English 12', year: 4 }
      ],
      color: 'hsl(280, 80%, 45%)' // Medium purple
    },
    {
      name: 'Minimum',
      courses: [
        { id: 'english-9-min', name: 'English 9', year: 1 },
        { id: 'english-10-min', name: 'English 10', year: 2 },
        { id: 'english-11-min', name: 'English 11', year: 3 },
        { id: 'not-required', name: 'Not required', year: 4 }
      ],
      color: 'hsl(280, 70%, 75%)' // Light purple
    }
  ];

  const handleCourseClick = (event, course) => {
    event.preventDefault();
    event.stopPropagation();
    parentHandleClick(event, course);
  }

  const commonButtonStyles = {
    width: '100%',
    height: cardHeight,
    backgroundColor: 'white',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    textTransform: 'none',
    whiteSpace: 'normal',
    lineHeight: 1.2,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  };

  const staticTextStyles = {
    ...commonButtonStyles,
    border: '2px dashed hsl(var(--border))',
    backgroundColor: 'transparent',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
    cursor: 'default',
    '&:hover': {
      transform: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: 'hsl(var(--muted-foreground))',
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
      maxHeight: 'calc(100vh - 400px)',
      overflow: 'auto',
      width: '100%'
    }}>
      {/* Tracks Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(100px, 120px) repeat(4, minmax(120px, 1fr))',
          sm: 'minmax(120px, 150px) repeat(4, minmax(150px, 1fr))'
        },
        gap: { xs: 2, sm: 3 },
        width: '100%'
      }}>
        {/* Track Rows */}
        {tracks.map((track, trackIndex) => (
          <React.Fragment key={track.name}>
            <Box sx={{ 
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: 'inherit',
              gap: 'inherit',
              borderBottom: trackIndex !== tracks.length - 1 ? '1px solid hsl(var(--border))' : 'none',
              pb: trackIndex !== tracks.length - 1 ? 3 : 0,
              mb: trackIndex !== tracks.length - 1 ? 3 : 0,
            }}>
              <Box sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                pl: 2,
                color: track.color,
                height: cardHeight
              }}>
                {track.name}
              </Box>
              {track.courses.map((course, index) => (
                <Box key={course.id} sx={{ 
                  position: 'relative',
                  height: cardHeight,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {course.name === 'Not required' ? (
                    <Box sx={{
                      ...staticTextStyles,
                      width: '100%',
                      height: cardHeight
                    }}>
                      {course.name}
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={(event) => handleCourseClick(event, course)}
                      sx={{
                        ...commonButtonStyles,
                        backgroundColor: track.color,
                        color: 'white',
                        borderColor: track.color,
                        '&:hover': {
                          backgroundColor: track.color,
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
          </React.Fragment>
        ))}
      </Box>

      {/* Electives Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        mt: 2
      }}>
        <Box sx={{ 
          color: '#000000',
          fontWeight: 600,
          fontSize: '1.125rem',
          pl: 2
        }}>
          Popular Electives
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          width: '100%'
        }}>
          {electives.map((elective) => (
            <Button
              key={elective.id}
              variant="outlined"
              onClick={(event) => handleCourseClick(event, elective)}
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
              {elective.name}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EnglishTracksTable; 