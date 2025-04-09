import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const siteUrl = Deno.env.get('SITE_URL') || 'https://app.youredu.school';
        
        console.log('API Key check:', resendApiKey ? 'Present' : 'Missing');
        console.log('Site URL:', siteUrl);

        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY');
        }

        // Parse request body
        const { invitation, householdName, siteUrl: requestSiteUrl } = await req.json();
        console.log('Received invitation request for:', invitation.invitee_email);
        
        if (!invitation || !householdName) {
            throw new Error('Missing required fields');
        }

        // Use the siteUrl from the request if provided, otherwise use the environment variable
        const finalSiteUrl = requestSiteUrl || siteUrl;

        // Generate invitation URL
        const inviteUrl = `${finalSiteUrl}/household-invitation/${invitation.invitation_token}`;
        console.log('Generated invite URL:', inviteUrl);

        // Prepare email content
        const memberTypeDisplay = invitation.member_type.charAt(0).toUpperCase() + invitation.member_type.slice(1);
        const subject = `Join ${householdName} on YourEDU as a ${memberTypeDisplay}`;
        
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
                        <h2 style="color: #2563EB; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">You're Invited to Join ${householdName}! 🎓</h2>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
                            Hello ${invitation.invitee_name},
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
                            You've been invited to join ${householdName} on YourEDU as a ${memberTypeDisplay.toLowerCase()}. 
                            YourEDU is a platform that helps families manage their homeschooling journey with ease.
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
                                Accept Invitation
                            </a>
                        </div>
                        
                        <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
                            <p style="margin: 0; color: #374151;">
                                This invitation will expire in 7 days. If you did not expect this invitation,
                                please ignore this email.
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
        `;

        console.log('Attempting to send email via Resend...');

        // Send email using Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'YourEDU <support@youredu.school>',
                to: invitation.invitee_email,
                subject: subject,
                html: htmlContent
            })
        });

        const responseData = await emailResponse.json();
        console.log('Resend API response:', responseData);

        if (!emailResponse.ok) {
            throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`);
        }

        return new Response(
            JSON.stringify({ 
                message: 'Invitation sent successfully',
                data: responseData
            }),
            {
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json' 
                },
                status: 200
            }
        );

    } catch (error) {
        console.error('Error in Edge Function:', error);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.stack
            }),
            {
                headers: { 
                    ...corsHeaders, 
                    'Content-Type': 'application/json' 
                },
                status: 400
            }
        );
    }
}); 