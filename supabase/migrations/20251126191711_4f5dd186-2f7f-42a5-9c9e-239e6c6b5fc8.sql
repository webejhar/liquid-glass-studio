-- Add account type enum
CREATE TYPE public.account_type AS ENUM ('general', 'service_provider', 'client');

-- Add new columns to profiles table for the 3-type account system
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'general',
ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_policy_accepted BOOLEAN DEFAULT false;

-- Create function to generate unique account numbers
CREATE OR REPLACE FUNCTION public.generate_account_number(acc_type public.account_type)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  random_num TEXT;
  new_account_number TEXT;
  exists_check BOOLEAN;
BEGIN
  -- Set prefix based on account type
  CASE acc_type
    WHEN 'general' THEN prefix := 'GEN-';
    WHEN 'service_provider' THEN prefix := 'SP-';
    WHEN 'client' THEN prefix := 'CLT-';
    ELSE prefix := 'GEN-';
  END CASE;
  
  -- Generate unique 6-digit number
  LOOP
    random_num := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_account_number := prefix || random_num;
    
    -- Check if this number already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE account_number = new_account_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_account_number;
END;
$$;

-- Create trigger to auto-generate account number on profile creation
CREATE OR REPLACE FUNCTION public.set_account_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.account_number IS NULL THEN
    NEW.account_number := public.generate_account_number(NEW.account_type);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_account_number
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_account_number();

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for CV bucket
CREATE POLICY "Users can upload their own CV"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own CV"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all CVs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cvs' AND has_role(auth.uid(), 'admin'));

-- Update profiles RLS to allow pending users to create profiles
CREATE POLICY "Users can create their own profile during registration"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for account type filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);