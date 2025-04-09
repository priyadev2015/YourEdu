// no longer used

// import React, { useState, useEffect } from 'react'
// import { useAuth } from '../utils/AuthContext'
// import { supabase } from '../utils/supabaseClient'
// import { Box, Container, CircularProgress, Tabs, Tab } from '@mui/material'
// import { PageHeader } from '../components/ui/typography'
// import TodoList from '../components/TodoList'
// import { toast } from 'react-toastify'

// const UserTodos = () => {
//   const { user } = useAuth()
//   const [loading, setLoading] = useState(true)
//   const [todos, setTodos] = useState([])
//   const [activeTab, setActiveTab] = useState('active')

//   useEffect(() => {
//     fetchTodos()
//   }, [user])

//   const fetchTodos = async () => {
//     try {
//       // First fetch all todos
//       const { data: todosData, error: todosError } = await supabase
//         .from('user_courses_todos')
//         .select('*')
//         .eq('uid', user.id)
//         .order('importance', { ascending: false })

//       if (todosError) throw todosError

//       // Then fetch course titles for all course IDs
//       const allCourseIds = todosData
//         .flatMap((todo) => todo.user_course_ids)
//         .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates

//       const { data: coursesData, error: coursesError } = await supabase
//         .from('user_courses')
//         .select('id, title')
//         .in('id', allCourseIds)

//       if (coursesError) throw coursesError

//       // Create a map of course IDs to titles
//       const courseTitlesMap = Object.fromEntries(coursesData.map((course) => [course.id, course.title]))

//       // Process todos to include course titles
//       const processedTodos = todosData.map((todo) => ({
//         ...todo,
//         course_titles: todo.user_course_ids.map((id) => courseTitlesMap[id]).filter(Boolean), // Remove any null/undefined values
//       }))

//       setTodos(processedTodos)
//     } catch (error) {
//       console.error('Error fetching todos:', error)
//       toast.error('Failed to load todos')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleTodoToggle = async (todoId, completed) => {
//     try {
//       const { error } = await supabase
//         .from('user_courses_todos')
//         .update({
//           completed,
//           completed_at: completed ? new Date().toISOString() : null,
//         })
//         .eq('id', todoId)

//       if (error) throw error

//       setTodos((prevTodos) =>
//         prevTodos.map((todo) =>
//           todo.id === todoId ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : null } : todo
//         )
//       )
//     } catch (err) {
//       console.error('Error updating todo:', err)
//       toast.error('Failed to update todo')
//     }
//   }

//   const filteredTodos = todos.filter((todo) => (activeTab === 'active' ? !todo.completed : todo.completed))

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
//         <CircularProgress />
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ py: 4, backgroundColor: 'hsl(var(--background))' }}>
//       <Container maxWidth="lg">
//         <PageHeader sx={{ mb: 4 }}>My Todos</PageHeader>

//         <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
//           <Tab label={`Active (${todos.filter((t) => !t.completed).length})`} value="active" />
//           <Tab label={`Completed (${todos.filter((t) => t.completed).length})`} value="completed" />
//         </Tabs>

//         <TodoList todos={filteredTodos} onTodoToggle={handleTodoToggle} showCourseInfo={true} />
//       </Container>
//     </Box>
//   )
// }

// export default UserTodos
