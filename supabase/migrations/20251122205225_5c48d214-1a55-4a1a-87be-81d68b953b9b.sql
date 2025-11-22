-- Create product_orders table for shop purchases
CREATE TABLE IF NOT EXISTS public.product_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  product_category TEXT NOT NULL,
  buyer_name TEXT,
  buyer_email TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create product orders" 
ON public.product_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view orders by email" 
ON public.product_orders 
FOR SELECT 
USING (true);