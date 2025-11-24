-- Create storage bucket for temporary images
INSERT INTO storage.buckets (id, name, public)
VALUES ('temp-images', 'temp-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create table to track temporary images
CREATE TABLE IF NOT EXISTS public.temp_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'temp-images',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_temp_images_expires_at ON public.temp_images(expires_at);

-- Enable RLS on temp_images table
ALTER TABLE public.temp_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert temp images
CREATE POLICY "Anyone can insert temp images"
ON public.temp_images
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can view temp images
CREATE POLICY "Anyone can view temp images"
ON public.temp_images
FOR SELECT
USING (true);

-- Policy: System can delete expired images
CREATE POLICY "System can delete expired images"
ON public.temp_images
FOR DELETE
USING (expires_at < now());

-- Storage policies for temp-images bucket
CREATE POLICY "Anyone can upload to temp-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'temp-images');

CREATE POLICY "Anyone can view temp-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'temp-images');

CREATE POLICY "System can delete from temp-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'temp-images');