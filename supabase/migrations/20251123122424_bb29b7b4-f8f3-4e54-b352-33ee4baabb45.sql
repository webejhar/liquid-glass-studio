-- Enable realtime for product_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_orders;

-- Enable realtime for domain_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_orders;