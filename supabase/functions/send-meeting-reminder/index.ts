import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (_req: Request): Promise<Response> => {
  console.log("Meeting reminder cron job started");

  try {
    // Get current time
    const now = new Date();
    
    // Calculate time 30 minutes from now
    const reminderTime = new Date(now.getTime() + 30 * 60000);
    
    // Format dates for comparison
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Fetch confirmed meetings scheduled for today
    const { data: meetings, error } = await supabase
      .from('meeting_bookings')
      .select('*')
      .eq('status', 'confirmed')
      .eq('meeting_date', today);

    if (error) {
      console.error("Error fetching meetings:", error);
      throw error;
    }

    console.log(`Found ${meetings?.length || 0} confirmed meetings today`);

    // Send reminders for meetings starting in approximately 30 minutes
    for (const meeting of meetings || []) {
      const [hours, minutes] = meeting.meeting_time.split(':').map(Number);
      
      // Check if meeting is approximately 30 minutes away (within 5 minute window)
      const minutesUntilMeeting = (hours * 60 + minutes) - (currentHour * 60 + currentMinute);
      
      if (minutesUntilMeeting >= 25 && minutesUntilMeeting <= 35) {
        console.log(`Sending reminder for meeting ${meeting.id}`);
        
        // Send reminder to user
        await resend.emails.send({
          from: "Webejhar <onboarding@resend.dev>",
          to: [meeting.email],
          subject: `⏰ Meeting Reminder - Starting in 30 Minutes`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f59e0b;">Meeting Reminder</h1>
              <p>Hi ${meeting.name},</p>
              <p>This is a friendly reminder that your meeting is starting in 30 minutes!</p>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h2 style="margin-top: 0; color: #92400e;">Meeting Details</h2>
                <p><strong>Date:</strong> ${meeting.meeting_date}</p>
                <p><strong>Time:</strong> ${meeting.meeting_time}</p>
                ${meeting.notes ? `<p><strong>Notes:</strong> ${meeting.notes}</p>` : ''}
              </div>
              <p>We're looking forward to meeting with you!</p>
              <p>Best regards,<br>The Webejhar Team</p>
            </div>
          `,
        });

        // Send reminder to admin
        await resend.emails.send({
          from: "Webejhar <onboarding@resend.dev>",
          to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
          subject: `⏰ [Admin] Meeting in 30 Minutes - ${meeting.name}`,
          html: `
            <h1>Meeting Reminder</h1>
            <p>Meeting with ${meeting.name} starting in 30 minutes</p>
            <p><strong>Email:</strong> ${meeting.email}</p>
            <p><strong>Phone:</strong> ${meeting.phone || 'N/A'}</p>
            <p><strong>Date:</strong> ${meeting.meeting_date}</p>
            <p><strong>Time:</strong> ${meeting.meeting_time}</p>
            ${meeting.notes ? `<p><strong>Notes:</strong> ${meeting.notes}</p>` : ''}
          `,
        });

        console.log(`Reminder sent for meeting ${meeting.id}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: meetings?.length || 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in meeting reminder cron:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
