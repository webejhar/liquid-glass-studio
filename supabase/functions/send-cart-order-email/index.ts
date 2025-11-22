import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartOrderEmailRequest {
  orderId: string;
  cartItems: CartItem[];
  totalPrice: number;
  buyerName: string;
  buyerEmail: string;
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
      orderId,
      cartItems,
      totalPrice,
      buyerName,
      buyerEmail,
      paymentMethod,
      paymentReference,
      timestamp
    }: CartOrderEmailRequest = await req.json();

    // Generate items list for email
    const itemsList = cartItems.map((item, index) => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">$${item.price}</td>
      </tr>`
    ).join('');
    
    // Email to admin (both email addresses)
    const adminEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: ["webejhar@gmail.com", "contact@rahatulllc.com"],
      subject: `[Webejhar] New Multi-Item Order — ${cartItems.length} items`,
      html: `
        <h1>New Multi-Item Order Received</h1>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Buyer Name:</strong> ${buyerName}</p>
        <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Reference:</strong> ${paymentReference}</p>
        <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
        
        <h2>Order Items:</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">#</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
              <td style="padding: 12px; border-top: 2px solid #ddd;">$${totalPrice}</td>
            </tr>
          </tfoot>
        </table>
        
        <p><strong>Status:</strong> Pending</p>
      `,
    });

    // Confirmation email to buyer
    const buyerEmailResponse = await resend.emails.send({
      from: "Webejhar <onboarding@resend.dev>",
      to: [buyerEmail],
      subject: `Order Confirmation — ${cartItems.length} items`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${buyerName},</p>
        <p>We have received your order for <strong>${cartItems.length} items</strong>.</p>
        
        <h2>Order Summary:</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">#</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
              <td style="padding: 12px; border-top: 2px solid #ddd;">$${totalPrice}</td>
            </tr>
          </tfoot>
        </table>
        
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Reference:</strong> ${paymentReference}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        
        <p>Please wait a few minutes while we process your order. We will contact you shortly with download/access instructions.</p>
        <p>Best regards,<br>The Webejhar Team</p>
      `,
    });

    console.log("Cart order emails sent successfully:", { adminEmailResponse, buyerEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-cart-order-email function:", error);
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
