import { supabase } from './supabaseClient'

/**
 * Updates a specific onboarding task's completion status
 * @param {string} userId - The user's ID
 * @param {('watched_video'|'completed_profile'|'added_students'|'created_course'|'submitted_feedback')} taskName - The task to mark as complete
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateOnboardingProgress = async (userId, taskName) => {
  if (!userId || !taskName) {
    console.error('❌ updateOnboardingProgress: Missing required parameters')
    return { success: false, error: new Error('Missing required parameters') }
  }

  try {
    console.log('🔄 Updating onboarding progress:', { userId, taskName })
    
    // First check if record exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('onboarding_progress')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // If no record exists, create one with all tasks false except the current one
    if (!existingRecord) {
      console.log('📝 Creating new onboarding progress record')
      const { error: insertError } = await supabase.from('onboarding_progress').insert({
        user_id: userId,
        watched_video: taskName === 'watched_video',
        completed_profile: taskName === 'completed_profile',
        added_students: taskName === 'added_students',
        created_course: taskName === 'created_course',
        submitted_feedback: taskName === 'submitted_feedback',
      })

      if (insertError) throw insertError
    } else {
      console.log('📝 Updating existing onboarding progress record')
      // Update existing record
      const { error: updateError } = await supabase
        .from('onboarding_progress')
        .update({
          [taskName]: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    }

    // Dispatch an event so any listening components can update their UI
    console.log('🔔 Dispatching onboarding-progress-updated event')
    window.dispatchEvent(
      new CustomEvent('onboarding-progress-updated', {
        detail: { taskName, userId },
      })
    )

    console.log('✅ Successfully updated onboarding progress')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Error updating onboarding progress:', error)
    return { success: false, error }
  }
}
