-- Create project_reviews table for rating/review system
CREATE TABLE public.project_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('client_to_provider', 'provider_to_client')),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, reviewer_id, review_type)
);

-- Create payment_receipts table for transaction records
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  order_id UUID,
  order_type TEXT CHECK (order_type IN ('product', 'domain', 'project')),
  payer_id UUID NOT NULL,
  payee_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('advance', 'final', 'full')),
  status TEXT DEFAULT 'pending',
  admin_fee NUMERIC DEFAULT 0,
  provider_amount NUMERIC DEFAULT 0,
  receipt_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for user and admin activity tracking
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  admin_id UUID,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_tickets table for help/support system
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'payment', 'account', 'order', 'project', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_messages table for ticket replies
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  rewards_earned NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_uses table
CREATE TABLE public.referral_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID NOT NULL,
  reward_amount NUMERIC DEFAULT 0,
  is_rewarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_settings table for admin configurable settings
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for admin announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'general', 'service_provider', 'client')),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_providers table for user favorites
CREATE TABLE public.saved_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Create provider_portfolios table
CREATE TABLE public.provider_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  project_url TEXT,
  category TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_availability table
CREATE TABLE public.provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL UNIQUE,
  is_available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'not_accepting')),
  available_hours_per_week INTEGER DEFAULT 40,
  hourly_rate NUMERIC,
  minimum_project_size TEXT,
  preferred_project_duration TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_content table for reporting inappropriate content
CREATE TABLE public.report_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('user', 'review', 'message', 'project', 'portfolio')),
  content_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_reviews
CREATE POLICY "Anyone can view approved reviews" ON public.project_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Project participants can add reviews" ON public.project_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Admins can manage all reviews" ON public.project_reviews FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_receipts
CREATE POLICY "Users can view their own receipts" ON public.payment_receipts FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);
CREATE POLICY "Admins can manage all receipts" ON public.payment_receipts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create receipts" ON public.payment_receipts FOR INSERT WITH CHECK (true);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity" ON public.activity_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for support_messages
CREATE POLICY "Ticket owners can view messages" ON public.support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Ticket owners can add messages" ON public.support_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all messages" ON public.support_messages FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all referral codes" ON public.referral_codes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view referral codes" ON public.referral_codes FOR SELECT USING (true);

-- RLS Policies for referral_uses
CREATE POLICY "Users can view referrals they made" ON public.referral_uses FOR SELECT USING (auth.uid() = referred_user_id);
CREATE POLICY "System can create referral uses" ON public.referral_uses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all referral uses" ON public.referral_uses FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_settings
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for saved_providers
CREATE POLICY "Users can view their saved providers" ON public.saved_providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save providers" ON public.saved_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved providers" ON public.saved_providers FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage saved providers" ON public.saved_providers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for provider_portfolios
CREATE POLICY "Anyone can view portfolios" ON public.provider_portfolios FOR SELECT USING (true);
CREATE POLICY "Providers can manage their own portfolios" ON public.provider_portfolios FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage all portfolios" ON public.provider_portfolios FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for provider_availability
CREATE POLICY "Anyone can view availability" ON public.provider_availability FOR SELECT USING (true);
CREATE POLICY "Providers can update their availability" ON public.provider_availability FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage availability" ON public.provider_availability FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for report_content
CREATE POLICY "Users can create reports" ON public.report_content FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.report_content FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage all reports" ON public.report_content FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_receipt_number TEXT;
BEGIN
  new_receipt_number := 'RCP-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_receipt_number;
END;
$$;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  new_code := '';
  FOR i IN 1..8 LOOP
    new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN new_code;
END;
$$;

-- Trigger to auto-generate receipt number
CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_payment_receipt_number
  BEFORE INSERT ON public.payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_receipt_number();

-- Trigger to auto-generate referral code
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_referral_code
  BEFORE INSERT ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_referral_code();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
  ('admin_fee_percentage', '5', 'number', 'Admin fee percentage for project payments'),
  ('usd_to_bdt_rate', '127', 'number', 'USD to BDT conversion rate'),
  ('minimum_project_budget', '10', 'number', 'Minimum project budget in USD'),
  ('maximum_review_length', '1000', 'number', 'Maximum character length for reviews'),
  ('referral_reward_amount', '5', 'number', 'Referral reward amount in USD'),
  ('support_email', '"support@webejhar.com"', 'string', 'Support email address'),
  ('max_file_upload_size', '52428800', 'number', 'Maximum file upload size in bytes (50MB)'),
  ('enable_email_notifications', 'true', 'boolean', 'Enable email notifications'),
  ('enable_sms_notifications', 'false', 'boolean', 'Enable SMS notifications'),
  ('maintenance_mode', 'false', 'boolean', 'Platform maintenance mode');

-- Enable realtime for important tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;