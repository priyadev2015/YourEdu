import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface EmailRequest {
  email: string
  name: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json() as EmailRequest
    console.log('Edge Function: Received request to send welcome email to:', email, 'with name:', name)
    console.log('Edge Function: Request headers:', JSON.stringify(req.headers))

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('Edge Function: RESEND_API_KEY not configured')
      throw new Error('RESEND_API_KEY not configured')
    }
    console.log('Edge Function: RESEND_API_KEY is configured')

    // Use the app's domain to reference the logo
    const logoUrl = 'https://app.youredu.school/logo192.png';

    // HTML template for the email
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
            <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Welcome to YourEDU 🎓</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Hello ${name},
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Thank you for creating your YourEDU account. You can now access all our homeschooling tools and resources at <a href="https://app.youredu.school" style="color: #2563EB; text-decoration: none; font-weight: 500;">app.youredu.school</a>.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              At YourEDU, we support parents like you with state compliance, record keeping, course hosting, and dual enrollment options for a personalized homeschooling experience.
            </p>
            
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="margin: 0; color: #374151;">
                We're currently in our early stages and value your input. Please share your thoughts through the Feedback & Support page in the app. Your insights help us improve.
              </p>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                Best regards,<br>
                Henry<br>
                YourEDU
              </p>
              
              <div style="text-align: center; margin-top: 16px;">
                <img src="${logoUrl}"
                     alt="YourEDU" 
                     width="200" 
                     height="50" 
                     style="width: 200px; height: auto; display: block; margin: 0 auto;">
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

    // Plain text version of the email
    const textContent = `
Hello ${name},

Thank you for creating your YourEDU account. You can now access all our homeschooling tools and resources at app.youredu.school.

At YourEDU, we support parents like you with state compliance, record keeping, course hosting, and dual enrollment options for a personalized homeschooling experience.

We're currently in our early stages and value your input. Please share your thoughts through the Feedback & Support page in the app. Your insights help us improve.

Best regards,
Henry
YourEDU

© ${new Date().getFullYear()} YourEDU. All rights reserved.
Making education accessible.
    `

    console.log('Edge Function: Preparing email payload:', {
      from: 'Henry @ YourEDU <henry@youredu.school>',
      to: email,
      subject: 'YourEDU Welcome Information 🎓'
    })

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Henry @ YourEDU <henry@youredu.school>',
        to: email,
        subject: 'YourEDU Welcome Information 🎓',
        html: htmlContent,
        text: textContent,
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@youredu.school?subject=Unsubscribe>`,
          'Precedence': 'bulk'
        }
      })
    })

    const responseData = await response.json()
    console.log('Edge Function: Resend API response:', JSON.stringify(responseData))

    if (!response.ok) {
      console.error('Edge Function: Failed to send email:', responseData)
      // Add more detailed error information
      const errorMessage = responseData.message || responseData.error || 'Unknown error occurred'
      throw new Error(`Failed to send email: ${errorMessage}`)
    }

    console.log('Edge Function: Welcome email sent successfully')
    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge Function: Error sending welcome email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 