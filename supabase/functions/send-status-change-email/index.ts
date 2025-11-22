import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusChangeRequest {
  type: 'booking' | 'order' | 'domain';
  status: string;
  recipientEmail: string;
  recipientName: string;
  details: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, status, recipientEmail, recipientName, details }: StatusChangeRequest = await req.json();

    let subject = "";
    let html = "";

    if (type === 'booking') {
      if (status === 'confirmed') {
        subject = `🎉 Meeting Confirmed - ${details.meeting_date}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Congratulations! Your Meeting is Confirmed</h1>
            <p>Hi ${recipientName},</p>
            <p>Great news! Your meeting request has been accepted.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Meeting Details</h2>
              <p><strong>Date:</strong> ${details.meeting_date}</p>
              <p><strong>Time:</strong> ${details.meeting_time}</p>
              ${details.notes ? `<p><strong>Notes:</strong> ${details.notes}</p>` : ''}
            </div>
            <p>We're looking forward to meeting with you!</p>
            <p>You'll receive a reminder 30 minutes before the meeting.</p>
            <p>Best regards,<br>The Webejhar Team</p>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = `Meeting Request Update - ${details.meeting_date}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Meeting Request Update</h1>
            <p>Hi ${recipientName},</p>
            <p>Thank you for your meeting request for ${details.meeting_date} at ${details.meeting_time}.</p>
            <p>Unfortunately, we're unable to confirm this time slot. Please submit a new request with alternative dates and times.</p>
            <p>We apologize for any inconvenience and look forward to scheduling with you soon.</p>
            <p>Best regards,<br>The Webejhar Team</p>
          </div>
        `;
      }
    } else if (type === 'order' || type === 'domain') {
      const itemName = type === 'order' ? details.product_name : details.domain_name;
      
      if (status === 'confirmed') {
        subject = `✅ Order Confirmed - ${itemName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Order Confirmed!</h1>
            <p>Hi ${recipientName},</p>
            <p>Your order has been confirmed and is being processed.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>${type === 'order' ? 'Product' : 'Domain'}:</strong> ${itemName}</p>
              ${type === 'order' ? `<p><strong>Price:</strong> $${details.product_price}</p>` : ''}
              <p><strong>Payment Reference:</strong> ${details.payment_reference}</p>
            </div>
            <p>We'll notify you once your order is ready for delivery.</p>
            <p>Best regards,<br>The Webejhar Team</p>
          </div>
        `;
      } else if (status === 'rejected') {
        subject = `Order Update - ${itemName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Order Update</h1>
            <p>Hi ${recipientName},</p>
            <p>We regret to inform you that we're unable to process your order for ${itemName}.</p>
            <p>If you made a payment, a full refund will be processed within 5-7 business days.</p>
            <p>Please contact us if you have any questions.</p>
            <p>Best regards,<br>The Webejhar Team</p>
          </div>
        `;
      } else if (status === 'completed') {
        subject = `🎊 Order Completed - ${itemName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Order Completed!</h1>
            <p>Hi ${recipientName},</p>
            <p>Great news! Your order for ${itemName} has been completed.</p>
            <p>Thank you for choosing Webejhar. We hope you're satisfied with our service!</p>
            <p>Best regards,<br>The Webejhar Team</p>
          </div>
        `;
      }
    }

    // Send email to user
    await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    // Send notification to admin
    await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
      subject: `[Admin] Status Changed: ${type} - ${status}`,
      html: `
        <h1>Status Update</h1>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>New Status:</strong> ${status}</p>
        <p><strong>Customer:</strong> ${recipientName} (${recipientEmail})</p>
        <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
      `,
    });

    console.log("Status change emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-change-email function:", error);
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
