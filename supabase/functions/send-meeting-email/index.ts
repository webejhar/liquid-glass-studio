import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingEmailRequest {
  name: string;
  email: string;
  phone?: string;
  meetingDate: string;
  meetingTime: string;
  notes?: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, meetingDate, meetingTime, notes, bookingId }: MeetingEmailRequest = await req.json();

    // Email to admin (both email addresses)
    const adminEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
      subject: `[Webejhar] New Meeting Booking — ${name}`,
      html: `
        <h1>New Meeting Booking</h1>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Meeting Date:</strong> ${meetingDate}</p>
        <p><strong>Meeting Time:</strong> ${meetingTime}</p>
        <p><strong>Notes:</strong> ${notes || 'None'}</p>
      `,
    });

    // Confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: [email],
      subject: `Meeting Confirmation — ${meetingDate}`,
      html: `
        <h1>Your meeting has been scheduled!</h1>
        <p>Hi ${name},</p>
        <p>Your meeting has been successfully scheduled.</p>
        <p><strong>Booking Reference:</strong> ${bookingId}</p>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Time:</strong> ${meetingTime}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>We look forward to meeting with you!</p>
        <p>Best regards,<br>The Webejhar Team</p>
      `,
    });

    console.log("Meeting emails sent successfully:", { adminEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-meeting-email function:", error);
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
