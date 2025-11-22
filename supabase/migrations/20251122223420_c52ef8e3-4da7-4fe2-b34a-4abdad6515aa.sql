-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_freelancer BOOLEAN DEFAULT false,
  linkedin_url TEXT,
  behance_url TEXT,
  website_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Admins can view all contacts
CREATE POLICY "Admins can view all contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Anyone can create contacts (public form)
CREATE POLICY "Anyone can create contacts"
ON public.contacts
FOR INSERT
WITH CHECK (true);

-- Admins can update contacts (add notes, change status)
CREATE POLICY "Admins can update contacts"
ON public.contacts
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Protect main admin from role deletion
CREATE OR REPLACE FUNCTION protect_main_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if trying to delete admin role for webejhar@gmail.com
  IF OLD.role = 'admin' THEN
    -- Get the user's email
    DECLARE
      user_email TEXT;
    BEGIN
      SELECT email INTO user_email
      FROM auth.users
      WHERE id = OLD.user_id;
      
      IF user_email = 'webejhar@gmail.com' THEN
        RAISE EXCEPTION 'Cannot remove admin role from main administrator';
      END IF;
    END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to protect main admin
DROP TRIGGER IF EXISTS protect_main_admin_trigger ON public.user_roles;
CREATE TRIGGER protect_main_admin_trigger
BEFORE DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION protect_main_admin();

-- Create notification trigger for new contacts
CREATE OR REPLACE FUNCTION notify_admin_new_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Contact Message',
    'New message from ' || NEW.name || ' (' || NEW.email || ')',
    'contact',
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_admin_new_contact_trigger ON public.contacts;
CREATE TRIGGER notify_admin_new_contact_trigger
AFTER INSERT ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION notify_admin_new_contact();