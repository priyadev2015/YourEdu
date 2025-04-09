import { convertCourseToGoogleEvent } from '../utils/calendarUtils'

class GoogleCalendarService {
  constructor() {
    this.supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  }

  async createUserCalendar(userId, userEmail, calendarName, sourceCalendars = null) {
    try {
      console.log('Calling calendar function with:', { userId, userEmail, calendarName, sourceCalendars })

      // For All Students calendar, we want to make it clear in the name
      const finalCalendarName =
        calendarName === 'All Students'
          ? `All Students Schedule`
          : calendarName
          ? `${calendarName}'s Schedule`
          : `Schedule for ${userEmail}`

      console.log('Creating calendar with name:', finalCalendarName)

      // For All Students calendar, we need to create a calendar and add other calendars as sources
      const endpoint = sourceCalendars
        ? `${this.supabaseUrl}/functions/v1/calendar/combined`
        : `${this.supabaseUrl}/functions/v1/calendar`

      console.log('Using endpoint:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          userEmail,
          calendarName: finalCalendarName,
          sourceCalendars: sourceCalendars
            ? sourceCalendars.map((cal) => ({
                calendarId: cal.id,
              }))
            : null,
        }),
      })

      // Get the raw response text first for better debugging
      const responseText = await response.text()
      console.log('Raw calendar creation response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse calendar creation response:', e)
        throw new Error(`Invalid response from server: ${responseText}`)
      }

      if (!response.ok) {
        console.error('Calendar creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data,
        })
        throw new Error(data.error || `Failed to create calendar: ${response.status} ${response.statusText}`)
      }

      console.log('Calendar function response:', data)

      if (!data.calendarId) {
        throw new Error('No calendar ID returned from server')
      }

      return data.calendarId
    } catch (error) {
      console.error('Error calling calendar function:', error)
      throw error
    }
  }

  async addCourseToCalendar(calendarId, course, studentInfo = null) {
    try {
      console.log('Converting course to calendar event:', {
        courseId: course.id,
        courseTitle: course.title,
        calendarId,
      })

      // If studentInfo is provided, add it to the course object for event conversion
      const courseWithStudent = studentInfo
        ? {
            ...course,
            student_id: studentInfo.studentId,
            student_name: studentInfo.studentName,
          }
        : course

      const events = convertCourseToGoogleEvent(courseWithStudent)
      console.log(`Generated ${events.length} events for course:`, course.title)

      // Add each event occurrence
      for (const event of events) {
        // If this is for a combined calendar, add student name to event title
        if (studentInfo) {
          event.summary = `${event.summary} (${studentInfo.studentName})`
        }

        console.log('Sending event to calendar:', {
          calendarId,
          eventSummary: event.summary,
          startTime: event.start?.dateTime || event.start?.date,
          endTime: event.end?.dateTime || event.end?.date,
        })

        const response = await fetch(`${this.supabaseUrl}/functions/v1/calendar/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            calendarId,
            event,
          }),
        })

        const responseText = await response.text()
        console.log('Raw event creation response:', responseText)

        if (!response.ok) {
          console.error('Failed response:', {
            status: response.status,
            statusText: response.statusText,
            body: responseText,
          })
          throw new Error(`Failed to add event to calendar: ${response.status} ${response.statusText}`)
        }

        let result
        try {
          result = JSON.parse(responseText)
        } catch (e) {
          console.error('Failed to parse response:', responseText)
          throw new Error('Invalid response from server')
        }

        // Check for either success flag or eventId
        if (!result.success && !result.eventId) {
          console.error('Event creation failed:', result)
          throw new Error(result.error || 'Event creation failed')
        }

        console.log('Event created successfully:', {
          eventId: result.eventId || result.id,
          summary: event.summary,
        })
      }

      return true
    } catch (error) {
      console.error('Error adding course to calendar:', {
        error: error.message,
        courseTitle: course.title,
        calendarId,
      })
      throw error
    }
  }

  async removeEventFromCalendar(calendarId, eventId) {
    try {
      const response = await fetch(`${this.baseUrl}/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ calendarId }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to remove event from calendar')
      }
    } catch (error) {
      console.error('Error removing event from calendar:', error)
      throw error
    }
  }

  async checkCalendarExists(calendarId) {
    try {
      console.log('Checking calendar existence:', calendarId)
      const response = await fetch(`${this.supabaseUrl}/functions/v1/calendar/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ calendarId }),
      })

      // Always try to get the response text first
      const responseText = await response.text()
      console.log('Raw response from calendar check:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText)
        throw new Error('Invalid response format from server')
      }

      if (!response.ok) {
        console.error('Calendar check failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        })
        throw new Error(`Failed to check calendar existence: ${data.reason || data.error || response.statusText}`)
      }

      console.log('Calendar check response:', data)
      return data.exists
    } catch (error) {
      console.error('Error in checkCalendarExists:', error)
      throw error
    }
  }

  async clearCalendarEvents(calendarId) {
    try {
      console.log('Clearing calendar events:', calendarId)
      const response = await fetch(`${this.supabaseUrl}/functions/v1/calendar/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ calendarId }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Clear calendar failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        throw new Error(`Failed to clear calendar events: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Clear calendar response:', data)
      return data.success
    } catch (error) {
      console.error('Error in clearCalendarEvents:', error)
      throw error
    }
  }
}

export default GoogleCalendarService
