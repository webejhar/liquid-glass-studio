-- Fix RLS policy for projects table to allow providers to update submission_files
DROP POLICY IF EXISTS "Providers can update their projects" ON public.projects;

CREATE POLICY "Providers can update their projects" 
ON public.projects 
FOR UPDATE 
USING ((auth.uid() = provider_id) OR (auth.uid() = client_id))
WITH CHECK ((auth.uid() = provider_id) OR (auth.uid() = client_id));

-- Create categories table for products
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.product_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default categories
INSERT INTO public.product_categories (name) VALUES 
  ('Themes'),
  ('Plugins'),
  ('Software'),
  ('Templates'),
  ('Graphics')
ON CONFLICT (name) DO NOTHING;