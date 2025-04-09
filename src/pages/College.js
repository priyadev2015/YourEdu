import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import { cardStyles } from '../styles/theme/components/cards';
import CollegePrep from './CollegePrep';
import Colleges from './Colleges';
import AdminMaterials from './AdminMaterials';
import StudentMaterials from './StudentMaterials';
import Scholarships from './Scholarships';
import YourEduLogo from '../assets/youredu-2.png';
import CommonAppLogo from '../assets/common-app.png';
import SchoolPhilosophy from './SchoolPhilosophy';
import Transcript from './Transcript';
import CourseDescription from './CourseDescriptions';
import GradingRubric from './GradingRubric';
import GuidanceLetter from './GuidanceCounselorLetter';
import PilotNotification from '../components/ui/PilotNotification';
import { BsEyeSlash } from 'react-icons/bs';

const College = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Base tabs that are always shown
  const baseTabs = [
    {
      label: 'Admin Materials',
      value: 'admin',
      component: <AdminMaterials onMaterialSelect={setSelectedMaterial} selectedMaterial={selectedMaterial} />
    },
    {
      label: 'Colleges',
      value: 'search',
      component: <Colleges />
    },
    {
      label: 'Scholarships',
      value: 'scholarships',
      component: <Scholarships />
    },
    {
      label: 'Timeline and Testing',
      value: 'prep',
      component: <CollegePrep />
    }
  ];

  // Development-only tabs
  const devTabs = window.location.hostname === 'localhost' ? [
    {
      label: 'Student Materials',
      value: 'student',
      component: <StudentMaterials />,
      devOnly: true
    }
  ] : [];

  // Combine base tabs with dev-only tabs
  const tabs = [...baseTabs, ...devTabs];

  const renderAdminMaterialContent = () => {
    switch (selectedMaterial) {
      case 'school-philosophy':
        return <SchoolPhilosophy onBack={() => setSelectedMaterial(null)} />;
      case 'transcript':
        return <Transcript onBack={() => setSelectedMaterial(null)} />;
      case 'course-descriptions':
        return <CourseDescription onBack={() => setSelectedMaterial(null)} />;
      case 'grading-rubric':
        return <GradingRubric onBack={() => setSelectedMaterial(null)} />;
      case 'guidance-counselor-letter':
        return <GuidanceLetter onBack={() => setSelectedMaterial(null)} />;
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    const tab = tabs.find(t => t.value === activeTab);
    if (activeTab === 'admin' && selectedMaterial) {
      return renderAdminMaterialContent();
    }
    return tab ? tab.component : null;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 3,
        position: 'relative'
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
              maxWidth: '60%'
            }}
          >
            Create your college application materials, and explore homeschool requirements by college, scholarships, and more 
          </Typography>

          {/* Partnership Logo Section */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: 'var(--container-padding-x)',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 'var(--spacing-2)',
              '@media (--tablet)': {
                right: 'var(--container-padding-x-mobile)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-4)',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'white',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <img 
                src={YourEduLogo}
                alt="YourEDU Logo" 
                style={{ height: '45px', width: 'auto' }}
              />
              <Box 
                sx={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: 'hsl(var(--text-primary))',
                  mx: 'var(--spacing-3)',
                  opacity: 0.8,
                }}
              >
                ×
              </Box>
              <img 
                src={CommonAppLogo}
                alt="Common App Logo" 
                style={{ height: '45px', width: 'auto' }}
              />
            </Box>
            <Box sx={{ 
              fontSize: '14px',
              fontWeight: '500',
              color: 'hsl(var(--text-primary))',
              opacity: 0.9,
              mt: 'var(--spacing-1)',
              letterSpacing: '0.02em',
            }}>
              Official Common App Partner
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'hsl(var(--brand-primary))',
            },
            mb: '-1px',
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  {tab.devOnly && (
                    <BsEyeSlash
                      style={{
                        fontSize: '14px',
                        color: 'var(--warning-color, #f59e0b)',
                        marginLeft: '4px'
                      }}
                    />
                  )}
                </Box>
              }
              value={tab.value}
              sx={{
                color: 'hsl(var(--muted-foreground))',
                '&.Mui-selected': {
                  color: 'hsl(var(--brand-primary))',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: 'hsl(var(--background))', pt: 0 }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
}

export default College; 