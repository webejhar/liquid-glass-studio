-- Add bio, skills, tags to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create projects/hire requests table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('normal_user', 'company')),
  project_title TEXT NOT NULL,
  project_details TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('low', 'high')),
  delivery_time_unit TEXT NOT NULL CHECK (delivery_time_unit IN ('hours', 'days', 'months')),
  delivery_time_value INTEGER NOT NULL,
  advance_percentage INTEGER NOT NULL CHECK (advance_percentage >= 0 AND advance_percentage <= 100),
  final_percentage INTEGER NOT NULL CHECK (final_percentage >= 0 AND final_percentage <= 100),
  final_budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'submitted', 'completed', 'cancelled')),
  advance_paid BOOLEAN DEFAULT FALSE,
  final_paid BOOLEAN DEFAULT FALSE,
  submission_files TEXT[],
  provider_payment_method TEXT,
  provider_payment_id TEXT,
  admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project messages table
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table for admin
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  category TEXT,
  tags TEXT[],
  images TEXT[],
  file_path TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Providers can update their projects" ON public.projects FOR UPDATE USING (auth.uid() = provider_id OR auth.uid() = client_id);
CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all projects" ON public.projects FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Project messages RLS
CREATE POLICY "Project participants can view messages" ON public.project_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (client_id = auth.uid() OR provider_id = auth.uid()))
);
CREATE POLICY "Project participants can send messages" ON public.project_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (client_id = auth.uid() OR provider_id = auth.uid()))
);

-- Products RLS
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User purchases RLS
CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON public.user_purchases FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update purchases" ON public.user_purchases FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for projects and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;