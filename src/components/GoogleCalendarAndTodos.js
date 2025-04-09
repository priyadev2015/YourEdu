import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import { Box, Paper, CircularProgress, Tabs, Tab } from '@mui/material'
import TodoList from './TodoList'
import { toast } from 'react-toastify'
import GoogleCalendarComponent from '../pages/MyGoogleCalendar'

const GoogleCalendarAndTodos = ({ height = 'calc(100vh - 80px)', embedded = false }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [todoLoading, setTodoLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    if (user) fetchTodos()
  }, [user])

  const fetchTodos = async () => {
    try {
      const { data: todosData, error: todosError } = await supabase
        .from('user_courses_todos')
        .select('*')
        .eq('uid', user.id)
        .order('importance', { ascending: false })

      if (todosError) throw todosError

      const allCourseIds = todosData
        .flatMap((todo) => todo.user_course_ids)
        .filter((id, index, self) => self.indexOf(id) === index)

      const { data: coursesData, error: coursesError } = await supabase
        .from('user_courses')
        .select('id, title')
        .in('id', allCourseIds)

      if (coursesError) throw coursesError

      const courseTitlesMap = Object.fromEntries(coursesData.map((course) => [course.id, course.title]))
      const processedTodos = todosData.map((todo) => ({
        ...todo,
        course_titles: todo.user_course_ids.map((id) => courseTitlesMap[id]).filter(Boolean),
      }))

      setTodos(processedTodos)
    } catch (error) {
      console.error('Error fetching todos:', error)
      toast.error('Failed to load todos')
    } finally {
      setTodoLoading(false)
      setLoading(false)
    }
  }

  const handleTodoToggle = async (todoId, completed) => {
    try {
      const { error } = await supabase
        .from('user_courses_todos')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', todoId)

      if (error) throw error

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : null } : todo
        )
      )
    } catch (err) {
      console.error('Error updating todo:', err)
      toast.error('Failed to update todo')
    }
  }

  if (loading) {
    return <div>Loading... {!user && '(Waiting for user authentication)'}</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return <div>Please log in to view your todos</div>
  }

  const mainContent = (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        height: 'calc(100vh - 80px)',
      }}
    >
      {/* Left Section - Google Calendar */}
      <Box
        sx={{
          flex: '2',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          p: 2,
        }}
      >
        <GoogleCalendarComponent containerHeight="calc(100% - 24px)" />
      </Box>

      {/* Todos Section */}
      <Box
        sx={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '400px',
          overflow: 'auto',
          p: 2,
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
        }}
      >
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab
            label={`Active (${todos.filter((t) => !t.completed).length})`}
            value="active"
            sx={{ fontSize: '0.875rem' }}
          />
          <Tab
            label={`Completed (${todos.filter((t) => t.completed).length})`}
            value="completed"
            sx={{ fontSize: '0.875rem' }}
          />
        </Tabs>

        {todoLoading ? (
          <CircularProgress />
        ) : (
          <TodoList
            todos={todos.filter((todo) => (activeTab === 'active' ? !todo.completed : todo.completed))}
            onTodoToggle={handleTodoToggle}
            showCourseInfo={true}
            compact={true}
          />
        )}
      </Box>
    </Box>
  )

  if (embedded) {
    return mainContent
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius-lg)',
        mb: 2,
      }}
    >
      {mainContent}
    </Paper>
  )
}

export default GoogleCalendarAndTodos
