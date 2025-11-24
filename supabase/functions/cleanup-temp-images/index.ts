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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting cleanup of expired temp images...');

    // Get expired images
    const { data: expiredImages, error: fetchError } = await supabase
      .from('temp_images')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired images:', fetchError);
      throw fetchError;
    }

    if (!expiredImages || expiredImages.length === 0) {
      console.log('No expired images found');
      return new Response(
        JSON.stringify({ message: 'No expired images to delete', deleted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredImages.length} expired images to delete`);

    let deletedCount = 0;
    let failedCount = 0;

    // Delete each expired image from storage
    for (const image of expiredImages) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from(image.bucket_name)
          .remove([image.file_path]);

        if (storageError) {
          console.error(`Failed to delete storage file ${image.file_path}:`, storageError);
          failedCount++;
          continue;
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('temp_images')
          .delete()
          .eq('id', image.id);

        if (dbError) {
          console.error(`Failed to delete database record ${image.id}:`, dbError);
          failedCount++;
        } else {
          deletedCount++;
          console.log(`Successfully deleted image: ${image.file_path}`);
        }
      } catch (err) {
        console.error(`Error processing image ${image.file_path}:`, err);
        failedCount++;
      }
    }

    console.log(`Cleanup complete. Deleted: ${deletedCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup completed',
        deleted: deletedCount,
        failed: failedCount,
        total: expiredImages.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in cleanup-temp-images function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to cleanup temp images' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
