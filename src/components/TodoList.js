import React from 'react'
import { Box, Paper, Checkbox, Button, Typography } from '@mui/material'
import { SupportingText } from './ui/typography'
import { TODO_TYPE_CONFIG, isSpecialTodo } from '../constants/SpecialCourseTodos'
import { useNavigate } from 'react-router-dom'

const TodoList = ({ todos, onTodoToggle, showCourseInfo = false, compact = false }) => {
  const navigate = useNavigate()

  const handleSpecialTodoClick = (todo) => {
    const config = TODO_TYPE_CONFIG[todo.special_todo_type]

    // Handle different routing patterns based on todo type
    if (todo.special_todo_type === 'ae_form') {
      navigate(`/sierra-college-ae-form/${todo.id}`)
    } else if (todo.special_todo_type.startsWith('campus_')) {
      // For Campus Community College todos, use the new route pattern
      navigate(`/campus-college-guide/${todo.special_todo_type}/${todo.id}`)
    } else {
      // For other todos, use the original pattern
      navigate(`${config.route}/${todo.id}`)
    }
  }

  if (!todos.length) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'hsl(var(--muted))',
          borderRadius: 2,
        }}
      >
        <SupportingText>No tasks remaining</SupportingText>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 1 : 3 }}>
      {todos.map((todo) => (
        <Paper
          key={todo.id}
          elevation={0}
          sx={{
            p: compact ? 1.5 : 3,
            border: '1px solid hsl(var(--border))',
            borderRadius: 2,
            backgroundColor: 'hsl(var(--card))',
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 0.5 : 2,
          }}
        >
          {!isSpecialTodo(todo.special_todo_type) && (
            <Checkbox
              checked={todo.completed}
              onChange={(e) => onTodoToggle(todo.id, e.target.checked)}
              size={compact ? 'small' : 'medium'}
              sx={{
                color: 'hsl(var(--muted-foreground))',
                '&.Mui-checked': {
                  color: 'hsl(var(--brand-primary))',
                },
              }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: compact ? 0.25 : 1,
                gap: compact ? 1 : 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: compact ? '0.8rem' : '1rem',
                  fontWeight: 500,
                  color: todo.completed ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  lineHeight: compact ? 1.2 : 1.5,
                }}
              >
                {todo.name}
              </Typography>
              {isSpecialTodo(todo.special_todo_type) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSpecialTodoClick(todo)}
                  sx={{
                    ml: compact ? 0.5 : 2,
                    borderColor: 'hsl(var(--brand-primary))',
                    color: 'hsl(var(--brand-primary))',
                    '&:hover': {
                      borderColor: 'hsl(var(--brand-primary))',
                      backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                    },
                    ...(compact && {
                      padding: '0px 4px',
                      minWidth: 'auto',
                      fontSize: '0.7rem',
                      height: '20px',
                      lineHeight: 1,
                      borderRadius: 1,
                    }),
                  }}
                >
                  {compact ? 'View' : TODO_TYPE_CONFIG[todo.special_todo_type].buttonText}
                </Button>
              )}
            </Box>
            {!compact && (
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                {todo.description}
              </Typography>
            )}
            {showCourseInfo && todo.course_titles && todo.course_titles.length > 0 && (
              <Typography
                sx={{
                  fontSize: compact ? '0.65rem' : '0.75rem',
                  color: 'hsl(var(--muted-foreground))',
                  mt: compact ? 0.25 : 1,
                  lineHeight: compact ? 1.2 : 1.5,
                }}
              >
                {todo.course_titles.length === 1
                  ? `Course: ${todo.course_titles[0]}`
                  : `Courses: ${todo.course_titles.join(', ')}`}
              </Typography>
            )}
            {todo.completed && todo.completed_at && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'hsl(var(--muted-foreground))',
                  mt: 1,
                }}
              >
                Completed on {new Date(todo.completed_at).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default TodoList
