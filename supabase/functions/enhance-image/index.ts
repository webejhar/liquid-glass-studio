import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, resolution, faceClean } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    console.log('Enhancing image with resolution:', resolution, 'Face clean:', faceClean);
    
    // Build resolution-specific prompt
    let resolutionPrompt = '';
    switch (resolution) {
      case 'HD':
        resolutionPrompt = 'Enhance this image to HD resolution (1920x1080) with crystal clear quality and sharp details.';
        break;
      case '2K':
        resolutionPrompt = 'Enhance this image to 2K resolution (2560x1440) with crystal clear quality, exceptional sharpness, and vibrant details.';
        break;
      case '4K':
        resolutionPrompt = 'Enhance this image to 4K ultra-high definition resolution (3840x2160) with lossless quality, extreme clarity, perfect sharpness, and stunning detail preservation.';
        break;
      default:
        resolutionPrompt = 'Enhance this image to high quality with improved clarity and sharpness.';
    }

    // Add face clean instructions
    const faceInstructions = faceClean
      ? ' Additionally, remove all blemishes, marks, spots, and skin imperfections from any faces in the image while keeping facial structure, shape, features, and expressions completely unchanged. Only smooth and clean the skin texture.'
      : ' Maintain all original details including any facial features, skin texture, blemishes, or marks exactly as they appear. Do not alter faces in any way.';

    const fullPrompt = resolutionPrompt + faceInstructions + ' Preserve the overall composition, colors, and style of the original image.';

    const content = [
      {
        type: "text",
        text: fullPrompt
      },
      {
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please contact support.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Gateway enhancement response received');

    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      throw new Error('No enhanced image generated in response');
    }

    // Convert base64 to blob and upload to storage
    try {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `${crypto.randomUUID()}.png`;
      const filePath = `generated/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('temp-images')
        .upload(filePath, binaryData, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('temp-images')
        .getPublicUrl(filePath);

      // Track in database
      const { error: dbError } = await supabase
        .from('temp_images')
        .insert({
          file_path: filePath,
          bucket_name: 'temp-images',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        });

      if (dbError) {
        console.error('Database tracking error:', dbError);
      }

      console.log('Enhanced image uploaded and tracked:', filePath);

      return new Response(
        JSON.stringify({ imageUrl: publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (storageError: any) {
      console.error('Error handling enhanced image storage:', storageError);
      return new Response(
        JSON.stringify({ imageUrl: imageBase64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in enhance-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to enhance image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
