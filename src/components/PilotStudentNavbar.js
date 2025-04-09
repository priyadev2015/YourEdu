import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import withAuthCheck from '../utils/withAuthCheck'
import {
  Box,
  List,
  ListItem,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import {
  AiOutlineHome,
} from 'react-icons/ai'
import {
  BsBook,
  BsListCheck,
  BsMortarboard,
} from 'react-icons/bs'
import { BodyText } from './ui/typography'

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

  return (
    <Box
      sx={{
        cursor: 'pointer',
        backgroundColor: isActive ? 'rgba(65, 105, 225, 0.12)' : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(65, 105, 225, 0.12)' : 'rgba(65, 105, 225, 0.06)',
        },
        transition: 'background-color 0.2s',
      }}
      onClick={handleClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : 'var(--spacing-3)',
          px: isCollapsed ? 'var(--spacing-2)' : 'var(--spacing-4)',
          py: 'var(--spacing-2)',
          color: isActive ? '#4169E1' : 'hsl(var(--text-primary))',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        {Icon && <Icon style={{ fontSize: isCollapsed ? 26 : 22 }} />}
        {!isCollapsed && (
          <BodyText
            sx={{
              color: 'inherit',
              fontWeight: isActive ? 600 : 400,
              fontSize: '1.1rem',
            }}
          >
            {label}
          </BodyText>
        )}
        {!isCollapsed && hasChildren && (
          <Box sx={{ ml: 'auto' }}>{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</Box>
        )}
      </Box>
    </Box>
  )
}

const PilotStudentNavbar = ({ handleInteraction, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [openSections, setOpenSections] = useState({})

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

  // Simplified navigation sections for pilot student users
  const pilotStudentNavSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: AiOutlineHome,
      to: '/parent-academics',
    },
    {
      id: 'activities',
      label: 'My Activities',
      icon: BsBook,
      to: '/my-courses',
    },
    {
      id: 'academics',
      label: 'Academics',
      icon: BsListCheck,
      to: '/course-planning',
    },
    {
      id: 'college',
      label: 'College',
      icon: BsMortarboard,
      to: '/common-app-landing',
    }
  ]

  return (
    <Box
      sx={{
        height: '100%',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'neutral.200',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiListItem-root': {
          transition: 'all 0.2s ease',
        },
        position: 'relative',
      }}
    >
      <Box sx={{ flex: 1, py: 'var(--spacing-4)' }}>
        <List
          sx={{
            p: 0,
            '& .MuiListItem-root': {
              display: 'block',
              p: 0,
            },
          }}
        >
          {/* Add hamburger menu toggle */}
          <Box
            onClick={onToggleCollapse}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 'var(--spacing-2)' : 'var(--spacing-4)',
              py: 'var(--spacing-2)',
              mb: 'var(--spacing-2)',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: 'rgba(65, 105, 225, 0.06)',
              },
            }}
          >
            {isCollapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 20 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 20 }} />
            )}
          </Box>

          {/* Pilot student nav sections */}
          {pilotStudentNavSections.map((section) => (
            <ListItem key={section.id} sx={{ mb: 'var(--spacing-1)' }}>
              <NavItem
                icon={section.icon}
                label={section.label}
                to={section.to}
                isActive={isActive(section.to)}
                handleInteraction={handleInteraction}
                isCollapsed={isCollapsed}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default withAuthCheck(PilotStudentNavbar) 