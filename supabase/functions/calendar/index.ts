import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { google } from 'npm:googleapis'
import { corsHeaders } from '../_shared/cors.ts'

const getGoogleAuth = () => {
  const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google service account credentials')
  }

  try {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'), // Try converting escaped newlines
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })
  } catch (error) {
    console.error('Auth creation error:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, method } = req
    const path = new URL(url).pathname
    // Extract the endpoint name from the full path
    const endpoint = path.split('/').pop()
    console.log('Request details:', { method, path, endpoint })

    // Initialize auth for each request
    const auth = getGoogleAuth()
    const authClient = await auth.getClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })

    // Handle calendar creation
    if (path === '/calendar' && method === 'POST') {
      const { userId, userEmail } = await req.json()
      console.log('Creating calendar for:', { userId, userEmail })

      try {
        // Create the calendar
        const result = await calendar.calendars.insert({
          requestBody: {
            summary: `Youredu Schedule - ${userEmail}`,
            timeZone: 'America/Los_Angeles',
          },
        })

        const calendarId = result.data.id

        // Instead of sharing with specific user, make calendar public
        await calendar.acl.insert({
          calendarId: calendarId,
          requestBody: {
            role: 'reader',
            scope: {
              type: 'default', // Makes calendar public
            },
          },
        })

        console.log('Calendar created and made public')
        return new Response(
          JSON.stringify({
            calendarId: calendarId,
            message: 'Calendar created and made public successfully',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error) {
        console.error('Google Calendar API error:', error)
        throw error
      }
    }

    // Handle event creation
    if (path === '/calendar/events' && method === 'POST') {
      const { calendarId, event } = await req.json()

      // Log the full event object and check color info
      console.log('Edge Function: Received event creation request:', {
        calendarId,
        eventSummary: event.summary,
        colorId: event.colorId,
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
      })

      try {
        // Get available colors first
        console.log('Edge Function: Fetching available calendar colors...')
        const colors = await calendar.colors.get()
        console.log('Edge Function: Available calendar colors:', {
          eventColors: colors.data.event,
          calendarColors: colors.data.calendar,
        })

        console.log('Edge Function: Creating event with color:', {
          requestedColorId: event.colorId,
          availableColorIds: Object.keys(colors.data.event || {}),
        })

        const result = await calendar.events.insert({
          calendarId,
          requestBody: event,
        })

        console.log('Edge Function: Event created successfully:', {
          eventId: result.data.id,
          colorId: result.data.colorId,
          status: result.data.status,
          htmlLink: result.data.htmlLink,
        })

        return new Response(
          JSON.stringify({
            eventId: result.data.id,
            htmlLink: result.data.htmlLink,
            success: true,
            colorInfo: {
              requestedColor: event.colorId,
              finalColor: result.data.colorId,
            },
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error) {
        // Log detailed error information
        console.error('Edge Function: Failed to create event:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          eventDetails: {
            summary: event.summary,
            colorId: event.colorId,
            startTime: event.start?.dateTime,
          },
        })
        throw error
      }
    }

    // Handle clearing all events from a calendar
    if (endpoint === 'clear' && method === 'POST') {
      const { calendarId } = await req.json()
      console.log('Clearing all events from calendar:', calendarId)

      try {
        // Get all events
        let pageToken = undefined
        do {
          const response = await calendar.events.list({
            calendarId: calendarId,
            pageToken: pageToken,
          })

          const events = response.data.items
          if (events && events.length > 0) {
            // Delete each event
            for (const event of events) {
              await calendar.events.delete({
                calendarId: calendarId,
                eventId: event.id,
              })
            }
          }
          pageToken = response.data.nextPageToken
        } while (pageToken)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'All events cleared successfully',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error) {
        console.error('Failed to clear calendar events:', error)
        throw error
      }
    }

    // Handle calendar existence check
    if (endpoint === 'check' && method === 'POST') {
      const { calendarId } = await req.json()
      console.log('Edge Function: Checking if calendar exists:', calendarId)

      try {
        // Log auth initialization
        console.log('Edge Function: Initializing Google auth')
        const auth = getGoogleAuth()
        const authClient = await auth.getClient()
        console.log('Edge Function: Auth client initialized')

        // Initialize calendar service
        console.log('Edge Function: Creating calendar service')
        const calendar = google.calendar({ version: 'v3', auth: authClient })
        console.log('Edge Function: Calendar service created')

        // Attempt to get calendar
        console.log('Edge Function: Attempting to get calendar')
        await calendar.calendars.get({
          calendarId: calendarId,
        })
        console.log('Edge Function: Calendar found successfully')

        return new Response(
          JSON.stringify({
            exists: true,
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (error) {
        // Log detailed error information
        console.error('Edge Function: Calendar check error:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
          status: error.response?.status,
        })

        // For 404, calendar doesn't exist
        if (error.response?.status === 404) {
          return new Response(
            JSON.stringify({
              exists: false,
              reason: 'Calendar not found',
            }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          )
        }

        // For auth errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          return new Response(
            JSON.stringify({
              exists: false,
              error: error.message,
              reason: 'Authentication error',
              details: error.response?.data,
            }),
            {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
              status: error.response?.status,
            }
          )
        }

        // For other errors
        return new Response(
          JSON.stringify({
            exists: false,
            error: error.message,
            reason: 'Error checking calendar',
            details: error.response?.data,
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 500,
          }
        )
      }
    }

    // If no handlers matched
    return new Response(
      JSON.stringify({
        error: 'Not found',
        path: path,
        endpoint: endpoint,
        method: method,
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to initialize Google Calendar service',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
