import { supabase } from './supabaseClient'
import { toast } from 'react-toastify'

export const markTodoComplete = async (todoId) => {
  try {
    console.log('Marking todo complete:', todoId)

    // First verify the todo exists
    const { data: existingTodo, error: fetchError } = await supabase
      .from('user_courses_todos')
      .select('*')
      .eq('id', todoId)
      .single()

    if (fetchError || !existingTodo) {
      console.error('Todo not found:', todoId)
      throw new Error(`Todo not found: ${todoId}`)
    }

    // Then update it
    const { data, error } = await supabase
      .from('user_courses_todos')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', todoId)
      .select()
      .single()

    if (error) throw error

    console.log('Todo updated successfully:', data)
    return true
  } catch (error) {
    console.error('Error completing todo:', error)
    toast.error('Failed to mark task as complete')
    return false
  }
}
