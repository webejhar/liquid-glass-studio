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
        <h1>Account Registration Received</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for registering as a <strong>${accountTypeLabel}</strong> on Webejhar.</p>
        <p>Your account is currently pending approval. Our team will review your information and you will receive an email notification once your account is approved.</p>
        <p>This process typically takes 1-2 business days.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>The Webejhar Team</p>
      `;
    } else if (status === 'approved') {
      subject = `[Webejhar] Your ${accountTypeLabel} Account Has Been Approved! 🎉`;
      html = `
        <h1>Account Approved!</h1>
        <p>Dear ${userName},</p>
        <p>Great news! Your <strong>${accountTypeLabel}</strong> account has been approved.</p>
        <p>You can now log in to your account and access all features.</p>
        <p><a href="${Deno.env.get('VITE_SUPABASE_URL')}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Log In Now</a></p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,<br>The Webejhar Team</p>
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
