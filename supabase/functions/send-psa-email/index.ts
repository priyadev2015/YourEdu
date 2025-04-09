// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  userId: string;
  email: string;
  name: string;
  state: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);

    const { userId, email, name, state } = body as RequestBody;

    // Validate required fields
    if (!userId || !email || !name || !state) {
      console.error('Missing required fields:', { userId, email, name, state });
      throw new Error('Missing required fields in request body');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Use the app's domain to reference the logo
    const logoUrl = 'https://app.youredu.school/logo192.png';

    // HTML template for the user email
    const userHtmlContent = `
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
            <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">PSA Submission Received! 📚</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
              Hi ${name}, thank you for submitting your California Private School Affidavit! We've received your submission and our team is processing it. 🎓
            </p>
            
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">What happens next?</h3>
              
              <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0; color: #111827;">
                  1. Our team will review your submission<br>
                  2. We'll process it with the California Department of Education<br>
                  3. You'll receive a confirmation email once completed
                </p>
              </div>
              
              <p style="margin: 0; color: #4B5563; font-size: 14px;">
                This typically takes 2-3 business days. You can check the status anytime in your YourEDU dashboard.
              </p>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                Best regards,<br>
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
    `;

    // HTML template for the admin notification
    const adminHtmlContent = `
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
            <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">New PSA Submission 📬</h2>
            
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Submission Details</h3>
              
              <div style="background-color: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0 0 8px 0; color: #111827;">
                  <strong style="color: #4B5563;">Name:</strong> ${name}<br>
                  <strong style="color: #4B5563;">Email:</strong> ${email}<br>
                  <strong style="color: #4B5563;">State:</strong> ${state}<br>
                  <strong style="color: #4B5563;">User ID:</strong> ${userId}
                </p>
              </div>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                YourEDU Admin Notification
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send confirmation email to user
    const userEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'YourEDU Support <support@youredu.school>',
        to: email,
        subject: 'PSA Submission Received! 📚 - YourEDU',
        html: userHtmlContent
      })
    });

    if (!userEmailResponse.ok) {
      const responseData = await userEmailResponse.json();
      throw new Error(`Failed to send user email: ${JSON.stringify(responseData)}`);
    }

    // Send notification to admin
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'YourEDU Support <support@youredu.school>',
        to: 'support@youredu.school',
        subject: `New PSA Submission - ${state}`,
        html: adminHtmlContent
      })
    });

    if (!adminEmailResponse.ok) {
      const responseData = await adminEmailResponse.json();
      console.error('Failed to send admin notification:', responseData);
      // Don't throw error here, as user email was sent successfully
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-psa-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
