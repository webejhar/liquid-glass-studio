-- Add payment document fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS advance_payment_method text,
ADD COLUMN IF NOT EXISTS advance_payment_reference text,
ADD COLUMN IF NOT EXISTS advance_payment_document text,
ADD COLUMN IF NOT EXISTS final_payment_method text,
ADD COLUMN IF NOT EXISTS final_payment_reference text,
ADD COLUMN IF NOT EXISTS final_payment_document text;