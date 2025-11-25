-- Add plugin file path column to product_orders table for downloadable plugins
ALTER TABLE public.product_orders
ADD COLUMN IF NOT EXISTS plugin_file_path TEXT;

-- Update the status check to include 'completed' status
-- This will allow orders to be marked as completed which triggers download availability
COMMENT ON COLUMN public.product_orders.status IS 'Order status: pending, confirmed, rejected, or completed';

-- Add completed status option (no constraint needed, just documentation)
-- Status values: pending, confirmed, rejected, completed