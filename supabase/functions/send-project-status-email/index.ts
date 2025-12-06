import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectStatusEmailRequest {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  status: 'submitted' | 'payment_received' | 'admin_approved' | 'completed';
  projectId: string;
  amount?: number;
}

const getEmailContent = (data: ProjectStatusEmailRequest) => {
  const { recipientName, projectTitle, status, amount } = data;
  
  switch (status) {
    case 'submitted':
      return {
        subject: `Project "${projectTitle}" Has Been Submitted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; text-align: center;">Project Submitted</h1>
            <p>Hello ${recipientName},</p>
            <p>Great news! The project <strong>"${projectTitle}"</strong> has been submitted by the service provider.</p>
            <p>Please review the deliverables and proceed with the final payment to complete the project.</p>
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="color: white; text-align: center; margin: 0; font-size: 18px;">
                Login to your account to review and pay
              </p>
            </div>
            <p>Best regards,<br>The WebEjhar Team</p>
          </div>
        `
      };
    
    case 'payment_received':
      return {
        subject: `Payment Received for "${projectTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">Payment Received</h1>
            <p>Hello ${recipientName},</p>
            <p>We have received the payment${amount ? ` of $${amount.toFixed(2)}` : ''} for the project <strong>"${projectTitle}"</strong>.</p>
            <p>The admin team will review and approve the payment shortly.</p>
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="color: white; text-align: center; margin: 0; font-size: 18px;">
                Payment is pending admin approval
              </p>
            </div>
            <p>Best regards,<br>The WebEjhar Team</p>
          </div>
        `
      };

    case 'admin_approved':
      return {
        subject: `Payment Approved for "${projectTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; text-align: center;">Payment Approved</h1>
            <p>Hello ${recipientName},</p>
            <p>The admin has approved the payment for the project <strong>"${projectTitle}"</strong>.</p>
            <p>The project is now officially completed. You can download the project files from your account.</p>
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="color: white; text-align: center; margin: 0; font-size: 18px;">
                Project Completed Successfully!
              </p>
            </div>
            <p>Thank you for using our platform!</p>
            <p>Best regards,<br>The WebEjhar Team</p>
          </div>
        `
      };
    
    case 'completed':
      return {
        subject: `Project "${projectTitle}" Completed!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; text-align: center;">🎉 Project Completed!</h1>
            <p>Hello ${recipientName},</p>
            <p>Congratulations! The project <strong>"${projectTitle}"</strong> has been completed successfully.</p>
            ${amount ? `<p>Total amount received: <strong>$${amount.toFixed(2)}</strong> (5% admin fee deducted = $${(amount * 0.95).toFixed(2)} to provider)</p>` : ''}
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="color: white; text-align: center; margin: 0; font-size: 18px;">
                Thank you for your work!
              </p>
            </div>
            <p>Best regards,<br>The WebEjhar Team</p>
          </div>
        `
      };
    
    default:
      return {
        subject: `Project "${projectTitle}" Status Update`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; text-align: center;">Project Status Update</h1>
            <p>Hello ${recipientName},</p>
            <p>The status of the project <strong>"${projectTitle}"</strong> has been updated.</p>
            <p>Please login to your account to check the details.</p>
            <p>Best regards,<br>The WebEjhar Team</p>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-project-status-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ProjectStatusEmailRequest = await req.json();
    console.log("Request data:", data);

    const { subject, html } = getEmailContent(data);

    console.log("Sending email to:", data.recipientEmail);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "WebEjhar <onboarding@resend.dev>",
        to: [data.recipientEmail],
        subject,
        html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-project-status-email function:", error);
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