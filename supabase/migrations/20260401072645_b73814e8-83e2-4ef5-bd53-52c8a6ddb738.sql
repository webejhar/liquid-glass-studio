
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bullets text[] DEFAULT '{}'::text[];
