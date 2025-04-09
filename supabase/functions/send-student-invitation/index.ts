import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Add type declarations for Deno
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    }
  }
}

const Deno = window.Deno

console.log('Edge Function: send-student-invitation loaded')

serve(async (req) => {
  console.log('Received request:', req.method)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Received request body:', JSON.stringify(body))

    const { studentName, studentEmail, parentName, invitationToken } = body

    // Validate required fields
    if (!studentName || !studentEmail || !parentName || !invitationToken) {
      throw new Error('Missing required fields')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const siteUrl = Deno.env.get('SITE_URL')

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    if (!siteUrl) {
      throw new Error('SITE_URL not configured')
    }

    console.log('Sending email to:', studentEmail)

    // Generate invitation URL
    const inviteUrl = `${siteUrl}/student-invitation/${invitationToken}`

    // HTML template for the email - using the new design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="margin: 0; padding: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; background-color: #F9FAFB;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px 15px; background-color: white;">
            <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Welcome to YourEDU, ${studentName}! 🎓</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              ${parentName} has invited you to join their homeschool on YourEDU!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              YourEDU is a platform that helps you manage your education and track your progress. With your own student account, you'll be able to access your courses, track your attendance, and more.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="
                background-color: #2563EB;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                display: inline-block;
              ">
                Set Up Your Account
              </a>
            </div>
            
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="margin: 0; color: #374151;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                Best regards,<br>
                Team YourEDU ✨
              </p>
              
              <div style="text-align: center; margin-top: 16px;">
                <picture>
                  <source srcset="https://app.youredu.school/youredu-2.png" type="image/png">
                  <source srcset="https://app.youredu.school/youredu-2.jpg" type="image/jpeg">
                  <img src="https://app.youredu.school/youredu-2.png" 
                       alt="YourEDU" 
                       width="120" 
                       height="120" 
                       style="width: 120px; height: auto; display: block; margin: 0 auto;"
                       onerror="this.onerror=null; this.src='https://app.youredu.school/logo192.png';">
                </picture>
              </div>
              
              <div style="text-align: center; margin-top: 16px; color: #9CA3AF; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} YourEDU. All rights reserved.</p>
                <p style="margin: 8px 0 0 0;">Making education accessible.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YourEDU <support@youredu.school>',
        to: studentEmail,
        subject: `${parentName} has invited you to join YourEDU`,
        html: htmlContent
      }),
    })

    const responseData = await emailResponse.json()
    console.log('Resend API response:', JSON.stringify(responseData))

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`)
    }

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully', data: responseData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 