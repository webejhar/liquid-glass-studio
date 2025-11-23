-- Add price column to domain_orders table to track domain purchase prices
ALTER TABLE public.domain_orders
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;