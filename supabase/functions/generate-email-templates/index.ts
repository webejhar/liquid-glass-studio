import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateEmailRequest {
  subject: string;
  details: string;
  keywords?: string;
  tone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, details, keywords, tone }: GenerateEmailRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create a prompt that asks for 4 variations in the user's language
    const systemPrompt = `You are an expert email writer. Generate 4 different email template variations based on the user's input. 
CRITICAL: Generate the emails in the EXACT SAME LANGUAGE as the user's input (subject and details). If they write in Spanish, respond in Spanish. If they write in French, respond in French, etc.

Return ONLY a JSON array with 4 objects, each containing:
- title: A short descriptive name for the variation (in the same language as input)
- content: The complete email text with subject line

The 4 variations should be:
1. Formal and comprehensive
2. Professional and medium length
3. Casual and friendly
4. Short and concise

Ensure proper formatting with line breaks and maintain the specified tone while adapting to each variation style.`;

    const userPrompt = `Generate 4 email template variations for:

Subject: ${subject}
Details/Notes: ${details}
${keywords ? `Keywords: ${keywords}` : ''}
Preferred Tone: ${tone}

Remember: Write ALL emails in the SAME LANGUAGE as the subject and details above. Include the subject line in each email.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    // Parse the JSON response from the AI
    let templates;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                       generatedText.match(/(\[[\s\S]*?\])/);
      
      if (jsonMatch) {
        templates = JSON.parse(jsonMatch[1]);
      } else {
        templates = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      // Fallback: create basic templates
      templates = [
        { title: "Formal", content: `Subject: ${subject}\n\n${details}` },
        { title: "Professional", content: `Subject: ${subject}\n\n${details}` },
        { title: "Casual", content: `Subject: ${subject}\n\n${details}` },
        { title: "Brief", content: `Subject: ${subject}\n\n${details}` }
      ];
    }

    console.log("Email templates generated successfully");

    return new Response(JSON.stringify({ templates }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json; charset=utf-8" 
      },
    });
  } catch (error: any) {
    console.error("Error in generate-email-templates function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate email templates" }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json; charset=utf-8" 
        },
      }
    );
  }
};

serve(handler);
