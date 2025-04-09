import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface EmailRequest {
  email: string
  name: string
  token: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, token } = await req.json() as EmailRequest
    console.log('Edge Function: Received request to send password reset email to:', email)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('Edge Function: RESEND_API_KEY not configured')
      throw new Error('RESEND_API_KEY not configured')
    }

    // Construct the login link with target path - use the token directly in the URL
    const loginLink = `${req.headers.get('origin')}/auth/confirm?token=${token}&type=recovery`
    console.log('Edge Function: Login link:', loginLink)

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
            <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Reset Your Password 🔐</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Hi ${name}, we received a request to reset your password for your YourEDU account.
            </p>
            
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Here's what to do:</h3>
              
              <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0; color: #111827;">
                  1. Click the one-time login link below<br>
                  2. Create a new password<br>
                  3. You'll be automatically logged in
                </p>
              </div>
              
              <a href="${loginLink}" style="display: inline-block; background-color: #2563EB; color: white; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 8px;">Reset Password</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 24px 0;">
              This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 14px; color: #6B7280; margin: 0;">
                YourEDU - Empowering education for all
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'YourEDU <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your YourEDU Password 🔐',
        html: htmlContent
      })
    })

    const responseData = await response.json()
    console.log('Edge Function: Resend API response:', responseData)

    if (!response.ok) {
      console.error('Edge Function: Failed to send email:', responseData)
      throw new Error(`Failed to send email: ${responseData.message || responseData.error || 'Unknown error occurred'}`)
    }

    console.log('Edge Function: Password reset email sent successfully')
    return new Response(
      JSON.stringify({ message: 'Password reset email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge Function: Error sending password reset email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 