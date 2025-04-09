import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import GoogleCalendarService from '../services/googleCalendarService'

export const useCalendarSync = (userId, calendarId) => {
  useEffect(() => {
    if (!userId || !calendarId) return

    const courseChannel = supabase
      .channel('course-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_courses',
          filter: `uid=eq.${userId}`,
        },
        async (payload) => {
          const googleCalendar = new GoogleCalendarService(/* auth client */)

          if (payload.eventType === 'INSERT') {
            // New course added
            await googleCalendar.addCourseToCalendar(calendarId, payload.new)
          } else if (payload.eventType === 'DELETE') {
            // Course removed
            await googleCalendar.removeEventFromCalendar(calendarId, payload.old.event_id)
          } else if (payload.eventType === 'UPDATE') {
            // Course updated
            await googleCalendar.removeEventFromCalendar(calendarId, payload.old.event_id)
            await googleCalendar.addCourseToCalendar(calendarId, payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(courseChannel)
    }
  }, [userId, calendarId])
}
