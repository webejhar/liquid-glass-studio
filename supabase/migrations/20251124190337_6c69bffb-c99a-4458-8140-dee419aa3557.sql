-- Fix RLS policies that are causing "permission denied for table users" error
-- The issue is that policies are trying to query auth.users table which is not allowed

-- Drop and recreate product_orders policies
DROP POLICY IF EXISTS "Users can view their own product orders" ON public.product_orders;

CREATE POLICY "Users can view their own product orders" 
ON public.product_orders 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Drop and recreate domain_orders policies  
DROP POLICY IF EXISTS "Users can view their own domain orders" ON public.domain_orders;

CREATE POLICY "Users can view their own domain orders"
ON public.domain_orders
FOR SELECT
USING (
  auth.uid() = user_id
);