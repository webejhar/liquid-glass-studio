import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalNotificationRequest {
  userName: string;
  userEmail: string;
  accountType: string;
  status: 'pending' | 'approved' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail, accountType, status }: ApprovalNotificationRequest = await req.json();

    const accountTypeLabel = accountType === 'service_provider' ? 'Service Provider' : 
                             accountType === 'client' ? 'Client' : 'General User';

    let subject = "";
    let html = "";

    if (status === 'pending') {
      subject = `[Webejhar] Your ${accountTypeLabel} Account is Pending Approval`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Registration Received</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              <p>Thank you for registering as a <strong>${accountTypeLabel}</strong> on Webejhar!</p>
              
              <div class="info-box">
                <h3>📋 Registration Details</h3>
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Account Type:</strong> ${accountTypeLabel}</p>
              </div>

              <p>Your account is currently <strong>pending approval</strong>. Our admin team will carefully review your information.</p>
              
              <p><strong>⏱️ Review Timeline:</strong> Your account will be reviewed within the next <strong>24 hours</strong>.</p>
              
              <p>You will receive another email notification once your account is approved, along with login instructions.</p>
              
              <p>Thank you for your patience!</p>
              
              <p>Best regards,<br><strong>The Webejhar Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Webejhar. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'approved') {
      const loginUrl = `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '')}/login`;
      
      subject = `[Webejhar] Your ${accountTypeLabel} Account Has Been Approved! 🎉`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-badge { background-color: #10B981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            .info-box { background-color: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; border-radius: 4px; }
            .login-button { background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .login-button:hover { background-color: #4338CA; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .highlight { background-color: #FEF3C7; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Account Approved!</h1>
              <div class="success-badge">✓ APPROVED</div>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              <p><strong>Congratulations!</strong> Your <strong>${accountTypeLabel}</strong> account has been successfully approved by our admin team.</p>
              
              <div class="info-box">
                <h3>📋 Your Account Details</h3>
                <p><strong>Full Name:</strong> ${userName}</p>
                <p><strong>Email Address:</strong> ${userEmail}</p>
                <p><strong>Account Type:</strong> ${accountTypeLabel}</p>
              </div>

              <h3>🔐 Login Information</h3>
              <p>You can now log in to your Webejhar account using:</p>
              <ul>
                <li><strong>Email:</strong> <span class="highlight">${userEmail}</span></li>
                <li><strong>Password:</strong> The password you created during registration</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${loginUrl}" class="login-button">🚀 Log In Now</a>
              </p>
              
              <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>

              <h3>✨ What's Next?</h3>
              <p>Once logged in, you'll have full access to all features and services available for ${accountTypeLabel} accounts.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Welcome aboard!</p>
              
              <p>Best regards,<br><strong>The Webejhar Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Webejhar. All rights reserved.</p>
              <p>Need help? Contact us at webejhar@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'rejected') {
      subject = `[Webejhar] Update on Your ${accountTypeLabel} Account Application`;
      html = `
        <h1>Account Application Update</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for your interest in registering as a <strong>${accountTypeLabel}</strong> on Webejhar.</p>
        <p>Unfortunately, we are unable to approve your account at this time.</p>
        <p>If you believe this is an error or would like more information, please contact our support team.</p>
        <p>Best regards,<br>The Webejhar Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });

    // Also notify admins about new registrations
    if (status === 'pending') {
      await resend.emails.send({
        from: "Webejhar <onboarding@resend.dev>",
        to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
        subject: `[Admin] New ${accountTypeLabel} Registration — ${userName}`,
        html: `
          <h1>New ${accountTypeLabel} Registration</h1>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Account Type:</strong> ${accountTypeLabel}</p>
          <p><strong>Status:</strong> Pending Approval</p>
          <p>Please review and approve/reject this registration in the admin panel.</p>
        `,
      });
    }

    console.log("Approval notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
