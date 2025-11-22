import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  service?: string;
  subject?: string;
  message: string;
  isFreelancer: boolean;
  linkedinUrl?: string;
  behanceUrl?: string;
  websiteUrl?: string;
  category?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactEmailRequest = await req.json();

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: ["webejhar@gmail.com"],
      subject: `[Webejhar] New Contact Message — ${data.name}`,
      html: `
        <h1>New Contact Message</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ''}
        ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ''}
        <p><strong>Message:</strong> ${data.message}</p>
        ${data.isFreelancer ? `
          <hr />
          <h2>Freelancer Information</h2>
          <p><strong>LinkedIn:</strong> ${data.linkedinUrl || 'Not provided'}</p>
          <p><strong>Behance:</strong> ${data.behanceUrl || 'Not provided'}</p>
          <p><strong>Website:</strong> ${data.websiteUrl || 'Not provided'}</p>
          <p><strong>Category:</strong> ${data.category || 'Not provided'}</p>
        ` : ''}
      `,
    });

    console.log("Contact email sent successfully:", adminEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
