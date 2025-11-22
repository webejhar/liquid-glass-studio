import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductOrderEmailRequest {
  productName: string;
  productPrice: number;
  productCategory: string;
  buyerEmail: string;
  buyerName?: string;
  paymentMethod: string;
  paymentReference: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      productName, 
      productPrice, 
      productCategory, 
      buyerEmail, 
      buyerName, 
      paymentMethod, 
      paymentReference, 
      timestamp 
    }: ProductOrderEmailRequest = await req.json();
    
    // Email to admin (both email addresses)
    const adminEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
      subject: `[Webejhar] New Product Order — ${productName}`,
      html: `
        <h1>New Product Order Received</h1>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Category:</strong> ${productCategory}</p>
        <p><strong>Price:</strong> $${productPrice}</p>
        <p><strong>Buyer Name:</strong> ${buyerName || 'Not provided'}</p>
        <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Reference:</strong> ${paymentReference}</p>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <p><strong>Status:</strong> Pending</p>
      `,
    });

    // Confirmation email to buyer
    const buyerEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: [buyerEmail],
      subject: `Order Confirmation — ${productName}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>We have received your order for <strong>${productName}</strong> (${productCategory}).</p>
        <p><strong>Price:</strong> $${productPrice}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Reference:</strong> ${paymentReference}</p>
        <p>Please wait a few minutes while we process your order. We will contact you shortly with download/access instructions.</p>
        <p>Best regards,<br>The Webejhar Team</p>
      `,
    });

    console.log("Product order emails sent successfully:", { adminEmailResponse, buyerEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-product-order-email function:", error);
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
