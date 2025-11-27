-- Update existing profiles without account_number to generate one
-- This ensures all users (including general users) have account numbers

-- First, update the set_account_number function to handle existing NULL values
CREATE OR REPLACE FUNCTION public.set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if account_number is NULL
  IF NEW.account_number IS NULL THEN
    NEW.account_number := public.generate_account_number(COALESCE(NEW.account_type, 'general'::account_type));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update all existing profiles without account numbers
UPDATE public.profiles
SET account_number = public.generate_account_number(COALESCE(account_type, 'general'::account_type))
WHERE account_number IS NULL;

-- Make account_number NOT NULL since all users should have one
ALTER TABLE public.profiles
ALTER COLUMN account_number SET NOT NULL;