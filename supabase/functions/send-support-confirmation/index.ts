import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupportMessage {
  name: string
  email: string
  category: string
  message: string
  user_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const messageData = await req.json() as SupportMessage
    console.log('Received support message:', messageData)

    // Validate required fields
    if (!messageData.email || !messageData.category || !messageData.message) {
      throw new Error('Missing required fields')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Get category label
    const categoryLabel = {
      support: 'Support Request',
      feedback: 'Feedback & Suggestions',
      question: 'General Question',
      other: 'Other'
    }[messageData.category] || messageData.category

    // Use the app's domain to reference the logo
    const logoUrl = 'https://app.youredu.school/logo192.png';

    // Send confirmation email to user
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'YourEDU Support <support@youredu.school>',
        to: messageData.email,
        bcc: ['support@youredu.school'],
        subject: 'We Got Your Message! 🎓 - YourEDU Support',
        html: `
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
                <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Hey ${messageData.name || 'there'} 👋</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
                  Thanks for reaching out! We've received your message and our team is on it. We love hearing from our community and will get back to you super soon! 🚀
                </p>
                
                <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Here's what you sent us:</h3>
                  
                  <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">Category</p>
                    <p style="margin: 4px 0 0 0; color: #111827; font-weight: 500;">${categoryLabel}</p>
                  </div>
                  
                  <div style="background-color: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">Your Message</p>
                    <p style="margin: 4px 0 0 0; color: #111827; white-space: pre-wrap; word-wrap: break-word;">${messageData.message}</p>
                  </div>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 24px 0; padding: 16px; background-color: #EFF6FF; border-radius: 8px; border-left: 4px solid #2563EB;">
                  We typically respond within 1-2 business days. Need to add something to your message? Just reply to this email! 💡
                </p>
                
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
                  <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                    Best wishes,<br>
                    Team YourEDU ✨
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
        `,
      })
    })

    const responseData = await emailResponse.json()
    console.log('Resend API response:', responseData)

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`)
    }

    return new Response(
      JSON.stringify({ message: 'Confirmation email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 