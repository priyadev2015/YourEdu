import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

// Import all the track table components
import MathTracksTable from './MathTracksTable';
import ScienceTracksTable from './ScienceTracksTable';
import EnglishTracksTable from './EnglishTracksTable';
import HistoryTracksTable from './HistoryTracksTable';
import LanguageTracksTable from './LanguageTracksTable';
import ArtsTracksTable from './ArtsTracksTable';
import ElectivesTracksTable from './ElectivesTracksTable';

const subjects = [
  { name: 'History / Social Studies', key: 'history' },
  { name: 'English', key: 'english' },
  { name: 'Mathematics', key: 'math' },
  { name: 'Science', key: 'science' },
  { name: 'Foreign Language', key: 'language' },
  { name: 'Visual & Performing Arts', key: 'fineArts' },
  { name: 'College-Prep Electives', key: 'electives' },
];

const SubjectTracks = ({ expandedSubject, setExpandedSubject, handleCourseClick }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on small screens
      minHeight: { xs: 'auto', md: '600px' }, // Auto height on small screens
      width: '100%',
      overflow: 'auto' // Allow scrolling
    }}>
      {/* Left Sidebar - Subject Areas */}
      <Box sx={{ 
        width: { xs: '100%', md: '300px' }, // Full width on small screens
        flexShrink: 0,
        backgroundColor: 'white',
        borderRadius: { 
          xs: '8px', 
          md: '8px 0 0 8px' 
        }, // Adjust border radius for stacked layout
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        mb: { xs: 2, md: 0 } // Add margin bottom on small screens
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
                selected={expandedSubject === subject.key}
                onClick={() => setExpandedSubject(subject.key)}
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
                      color: expandedSubject === subject.key ? 
                        'hsl(var(--brand-primary))' : 
                        'hsl(var(--foreground))',
                      fontWeight: expandedSubject === subject.key ? 600 : 400
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

      {/* Right Content Area - Course Tracks */}
      <Box sx={{ 
        flex: 1,
        height: { xs: 'auto', md: '100%' }, // Auto height on small screens
        minHeight: { xs: '500px', md: 'auto' } // Minimum height on small screens
      }}>
        <Box sx={{ 
          backgroundColor: 'white', 
          borderRadius: { 
            xs: '8px', 
            md: '0 8px 8px 0' 
          }, // Adjust border radius for stacked layout
          border: '1px solid hsl(var(--border))',
          borderLeft: { xs: '1px solid hsl(var(--border))', md: 'none' }, // Add border on small screens
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--muted))',
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(80px, 100px) repeat(4, minmax(80px, 1fr))', // Smaller on mobile
              sm: 'minmax(100px, 120px) repeat(4, minmax(100px, 1fr))',
              md: 'minmax(120px, 150px) repeat(4, minmax(150px, 1fr))'
            },
            gap: { xs: 1, sm: 2, md: 3 }, // Smaller gap on mobile
            overflowX: 'auto' // Allow horizontal scrolling if needed
          }}>
            <Typography sx={{ 
              color: '#000000',
              fontWeight: 600,
              fontSize: '1.125rem',
              display: 'flex',
              alignItems: 'center',
              pl: 2
            }}>
              Track
            </Typography>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => (
              <Typography key={year} sx={{ 
                color: '#000000',
                fontWeight: 600,
                fontSize: '1.125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {year}
              </Typography>
            ))}
          </Box>
          
          <Box sx={{ 
            p: { xs: 1, sm: 2, md: 3 }, // Smaller padding on mobile
            overflow: 'auto', // Allow scrolling
            flex: 1 // Take remaining space
          }}>
            {expandedSubject === 'math' ? (
              <MathTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'science' ? (
              <ScienceTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'english' ? (
              <EnglishTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'history' ? (
              <HistoryTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'language' ? (
              <LanguageTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'fineArts' ? (
              <ArtsTracksTable handleCourseClick={handleCourseClick} />
            ) : expandedSubject === 'electives' ? (
              <ElectivesTracksTable handleCourseClick={handleCourseClick} />
            ) : (
              <Box sx={{ 
                textAlign: 'center',
                py: 4,
                backgroundColor: 'white',
                borderRadius: 1,
                border: '1px dashed #e2e8f0'
              }}>
                <Typography sx={{ color: '#718096' }}>
                  Select a subject to view available course tracks
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SubjectTracks; 