
ALTER TABLE public.provider_portfolios 
ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS bullets text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS completion_date text,
ADD COLUMN IF NOT EXISTS technologies_used text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS live_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS testimonial text,
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
