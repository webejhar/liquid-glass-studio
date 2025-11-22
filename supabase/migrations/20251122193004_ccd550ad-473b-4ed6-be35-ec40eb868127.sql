-- Create domain_orders table
CREATE TABLE public.domain_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  buyer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting_bookings table
CREATE TABLE public.meeting_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domain_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_bookings ENABLE ROW LEVEL SECURITY;

-- Public can insert orders (no auth required for public ordering)
CREATE POLICY "Anyone can create domain orders"
ON public.domain_orders
FOR INSERT
TO public
WITH CHECK (true);

-- Public can view their own orders by email
CREATE POLICY "Users can view orders by email"
ON public.domain_orders
FOR SELECT
TO public
USING (true);

-- Public can insert meeting bookings
CREATE POLICY "Anyone can create meeting bookings"
ON public.meeting_bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Public can view their own bookings by email
CREATE POLICY "Users can view bookings by email"
ON public.meeting_bookings
FOR SELECT
TO public
USING (true);