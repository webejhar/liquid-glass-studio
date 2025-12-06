import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: "order" | "support_ticket" | "registration" | "project" | "contact";
  title: string;
  details: Record<string, any>;
  adminEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin notification email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, details, adminEmail = "webejhar@gmail.com" }: AdminNotificationRequest = await req.json();
    
    console.log("Sending admin notification:", { type, title, adminEmail });

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "order":
        subject = `🛒 New Order: ${details.productName || details.domainName || "Order"}`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">🛒 New Order Received</h1>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #fff; margin-top: 0;">Order Details</h2>
              <p style="color: #ccc; margin: 8px 0;"><strong>Product:</strong> ${details.productName || details.domainName || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Buyer:</strong> ${details.buyerName || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Email:</strong> ${details.buyerEmail || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Amount:</strong> $${details.amount || "0"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Payment Method:</strong> ${details.paymentMethod || "N/A"}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://webejhar.lovable.app/admin/orders" style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #0099cc); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Order</a>
            </div>
          </div>
        `;
        break;

      case "support_ticket":
        subject = `🎫 New Support Ticket: ${details.subject || "Support Request"}`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff6b6b; margin: 0; font-size: 28px;">🎫 New Support Ticket</h1>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #fff; margin-top: 0;">Ticket Details</h2>
              <p style="color: #ccc; margin: 8px 0;"><strong>Subject:</strong> ${details.subject || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Category:</strong> ${details.category || "General"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Priority:</strong> ${details.priority || "Medium"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Description:</strong></p>
              <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; color: #ddd;">${details.description || "No description"}</div>
            </div>
            <div style="text-align: center;">
              <a href="https://webejhar.lovable.app/admin/support" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ee5a5a); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Ticket</a>
            </div>
          </div>
        `;
        break;

      case "registration":
        subject = `👤 New User Registration: ${details.name || "New User"}`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4ecdc4; margin: 0; font-size: 28px;">👤 New User Registration</h1>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #fff; margin-top: 0;">User Details</h2>
              <p style="color: #ccc; margin: 8px 0;"><strong>Name:</strong> ${details.name || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Email:</strong> ${details.email || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Account Type:</strong> ${details.accountType || "General"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Status:</strong> ${details.status || "Pending"}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://webejhar.lovable.app/admin/users" style="display: inline-block; background: linear-gradient(135deg, #4ecdc4, #3dbdb5); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View User</a>
            </div>
          </div>
        `;
        break;

      case "project":
        subject = `📋 New Project Request: ${details.projectTitle || "New Project"}`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #a855f7; margin: 0; font-size: 28px;">📋 New Project Request</h1>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #fff; margin-top: 0;">Project Details</h2>
              <p style="color: #ccc; margin: 8px 0;"><strong>Title:</strong> ${details.projectTitle || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Client:</strong> ${details.clientName || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Budget:</strong> $${details.budget || "TBD"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Delivery:</strong> ${details.deliveryTime || "N/A"}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://webejhar.lovable.app/admin/project-orders" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #9333ea); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Project</a>
            </div>
          </div>
        `;
        break;

      case "contact":
        subject = `📬 New Contact Message: ${details.subject || "Contact Form"}`;
        htmlContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">📬 New Contact Message</h1>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #fff; margin-top: 0;">Message Details</h2>
              <p style="color: #ccc; margin: 8px 0;"><strong>From:</strong> ${details.name || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Email:</strong> ${details.email || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Subject:</strong> ${details.subject || "N/A"}</p>
              <p style="color: #ccc; margin: 8px 0;"><strong>Message:</strong></p>
              <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; color: #ddd;">${details.message || "No message"}</div>
            </div>
            <div style="text-align: center;">
              <a href="https://webejhar.lovable.app/admin/contacts" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Message</a>
            </div>
          </div>
        `;
        break;

      default:
        subject = title;
        htmlContent = `<p>${JSON.stringify(details)}</p>`;
    }

    // Send email using Resend API directly via fetch
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Webejhar <onboarding@resend.dev>",
        to: [adminEmail],
        subject,
        html: htmlContent,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
