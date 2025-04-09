import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material'
import { supabase } from '../utils/supabaseClient'

const CoursePeople = ({ courseId }) => {
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)

  const fetchProfileData = async (uids) => {
    if (!uids || uids.length === 0) return []

    const { data, error } = await supabase
      .from('account_profiles')
      .select('id, name, email, profile_picture')
      .in('id', uids)

    if (error) throw error

    // Create a map for quick lookup
    const profileMap = new Map(data.map((profile) => [profile.id, profile]))

    // Return profiles in the same order as uids
    return uids.map((uid) => {
      const profile = profileMap.get(uid)
      return (
        profile || {
          id: uid,
          name: 'Account not found',
          email: null,
          profile_picture: null,
        }
      )
    })
  }

  useEffect(() => {
    const loadPeople = async () => {
      try {
        setLoading(true)

        // Fetch course data with a simple query
        const { data: courseData, error: courseError } = await supabase
          .from('youredu_courses')
          .select('students, teachers, creator_id') // Simple select without joins
          .eq('id', courseId)
          .single()

        if (courseError) throw courseError

        // Fetch profile data for teachers and students
        const teacherProfiles = await fetchProfileData(courseData.teachers || [])
        const studentProfiles = await fetchProfileData(courseData.students || [])

        // Fetch creator's profile separately
        if (courseData.creator_id) {
          const { data: creatorProfile, error: creatorError } = await supabase
            .from('account_profiles')
            .select('id, name, email, profile_picture')
            .eq('id', courseData.creator_id)
            .single()

          if (!creatorError && creatorProfile) {
            // Add creator to teachers if not already included
            if (!teacherProfiles.find((p) => p.id === creatorProfile.id)) {
              teacherProfiles.unshift(creatorProfile)
            }
          }
        }

        setTeachers(teacherProfiles)
        setStudents(studentProfiles)
      } catch (err) {
        console.error('Error loading people:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPeople()
  }, [courseId])

  const PersonList = ({ title, people }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
        {title} ({people.length})
      </Typography>
      <List>
        {people.map((person, index) => (
          <React.Fragment key={person.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={person.profile_picture} alt={person.name}>
                  {person.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={person.name}
                secondary={person.email}
                primaryTypographyProps={{ sx: { color: '#2d3748' } }}
                secondaryTypographyProps={{ sx: { color: '#718096' } }}
              />
            </ListItem>
            {index < people.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">Error loading people: {error}</Typography>

  return (
    <Box>
      <PersonList title="Teachers" people={teachers} />
      <PersonList title="Students" people={students} />
    </Box>
  )
}

export default CoursePeople
