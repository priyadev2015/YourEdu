import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Container, Tabs, Tab } from '@mui/material'
import { PageHeader } from '../components/ui/typography.jsx'
import RecordKeeping from './RecordKeeping'
import IdGenerationView from './IdGenerationView'
import Transcript from './Transcript'
import CourseDescriptions from './CourseDescriptions'
import WorkPermitsView from './WorkPermitsView'
import WorkPermits from './WorkPermits'
import { cardStyles } from '../styles/theme/components/cards'
import PilotNotification from '../components/ui/PilotNotification'

const MyHomeschool = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('membership-id')
  const [showWorkPermitForm, setShowWorkPermitForm] = useState(false)

  // Set initial active tab based on URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some(tab => tab.value === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleShowWorkPermitForm = () => {
    setShowWorkPermitForm(true)
  }

  const handlePermitGenerated = () => {
    setShowWorkPermitForm(false)
  }

  const tabs = [
    {
      label: 'YourEDU Membership ID',
      value: 'membership-id',
      component: <IdGenerationView />
    },
    {
      label: 'Record Keeping',
      value: 'record-keeping',
      component: <RecordKeeping />
    },
    {
      label: 'Transcript',
      value: 'transcript',
      component: <Transcript />
    },
    {
      label: 'Course Descriptions',
      value: 'course-descriptions',
      component: <CourseDescriptions />
    },
    {
      label: 'Work Permits',
      value: 'work-permits',
      component: showWorkPermitForm ? (
        <WorkPermits onPermitGenerated={handlePermitGenerated} />
      ) : (
        <WorkPermitsView onShowWorkPermitForm={handleShowWorkPermitForm} />
      )
    }
  ]

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue)
    setSearchParams({ tab: newValue })
  }

  const renderTabContent = () => {
    const tab = tabs.find(t => t.value === activeTab)
    return tab ? tab.component : null
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--container-padding-y)',
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ position: 'relative', height: '2.5rem' }}>
            <PageHeader>My Homeschool</PageHeader>
            <PilotNotification message="Access and manage all your homeschool records, documents, and ID cards here" />
          </Box>

          <Box sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'hsl(var(--brand-primary))',
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
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
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: 'hsl(var(--background))' }}>
        {renderTabContent()}
      </Box>
    </Box>
  )
}

export default MyHomeschool
