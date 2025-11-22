import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DomainCheckRequest {
  domainBase: string;
}

interface DomainResult {
  tld: string;
  available: boolean;
}

const TLDS = [
  ".com", ".org", ".net", ".xyz", ".dev", ".co", ".io", ".shop",
  ".online", ".site", ".tech", ".app", ".store", ".blog", ".info",
  ".biz", ".me", ".co.uk", ".us", ".agency"
];

// Mock domain checker - in production, use a WHOIS/DNS API
// Popular domains are usually taken, others have random availability
const mockDomainCheck = (domainBase: string, tld: string): boolean => {
  const fullDomain = `${domainBase}${tld}`.toLowerCase();
  
  // Common words are likely taken
  const commonWords = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'test', 'example', 'demo'];
  if (commonWords.some(word => domainBase.toLowerCase().includes(word))) {
    return false;
  }
  
  // Generate pseudo-random availability based on domain hash
  const hash = fullDomain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 3 !== 0; // ~66% availability rate
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domainBase }: DomainCheckRequest = await req.json();

    if (!domainBase || domainBase.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Domain base is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results: DomainResult[] = TLDS.map(tld => ({
      tld: tld,
      available: mockDomainCheck(domainBase, tld)
    }));

    console.log(`Domain check for: ${domainBase}`, results);

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in check-domain function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to check domain availability" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
