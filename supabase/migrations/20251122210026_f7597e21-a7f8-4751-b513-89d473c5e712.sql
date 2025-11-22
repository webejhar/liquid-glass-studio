-- Add order_id to group multiple products in one order
ALTER TABLE public.product_orders 
ADD COLUMN IF NOT EXISTS order_id UUID DEFAULT gen_random_uuid();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_orders_order_id ON public.product_orders(order_id);

-- Add buyer_name column if it doesn't exist
ALTER TABLE public.product_orders 
ADD COLUMN IF NOT EXISTS buyer_name TEXT;