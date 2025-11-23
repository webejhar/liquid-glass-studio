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
  price: number; // Price in USD
}

const TLDS = [
  ".com", ".org", ".net", ".xyz", ".dev", ".co", ".io", ".shop",
  ".online", ".site", ".tech", ".app", ".store", ".blog", ".info",
  ".biz", ".me", ".co.uk", ".us", ".agency"
];

// Pricing for each TLD in USD
const TLD_PRICING: { [key: string]: number } = {
  ".com": 12.99,
  ".org": 14.99,
  ".net": 13.99,
  ".xyz": 9.99,
  ".dev": 14.99,
  ".co": 29.99,
  ".io": 39.99,
  ".shop": 34.99,
  ".online": 24.99,
  ".site": 19.99,
  ".tech": 49.99,
  ".app": 14.99,
  ".store": 54.99,
  ".blog": 29.99,
  ".info": 19.99,
  ".biz": 19.99,
  ".me": 19.99,
  ".co.uk": 9.99,
  ".us": 9.99,
  ".agency": 24.99
};

// Real-time domain availability check using DNS resolution
const checkDomainAvailability = async (domainBase: string, tld: string): Promise<boolean> => {
  const fullDomain = `${domainBase}${tld}`;
  
  try {
    // Try to resolve the domain using DNS
    const records = await Deno.resolveDns(fullDomain, "A");
    
    // If we get records, the domain is taken
    if (records && records.length > 0) {
      return false; // Domain is taken
    }
    
    return true; // Domain might be available
  } catch (error) {
    // If DNS resolution fails, the domain is likely available
    // (no DNS records exist for it)
    return true;
  }
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

    // Clean the domain base (remove any special characters)
    const cleanDomainBase = domainBase.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Check all TLDs in parallel for faster response
    const checkPromises = TLDS.map(async (tld) => ({
      tld: tld,
      available: await checkDomainAvailability(cleanDomainBase, tld),
      price: TLD_PRICING[tld] || 19.99 // Default price if not found
    }));

    const results: DomainResult[] = await Promise.all(checkPromises);

    console.log(`Real-time domain check for: ${cleanDomainBase}`, results);

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
