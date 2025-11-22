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
      available: await checkDomainAvailability(cleanDomainBase, tld)
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
