ALTER TABLE public.provider_portfolios
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_for_sale boolean NOT NULL DEFAULT false;

ALTER TABLE public.product_orders
  ALTER COLUMN product_id TYPE text USING product_id::text;

ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS product_source_id uuid,
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_region text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS order_notes text,
  ADD COLUMN IF NOT EXISTS is_seen boolean NOT NULL DEFAULT false;

ALTER TABLE public.domain_orders
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_region text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS order_notes text,
  ADD COLUMN IF NOT EXISTS is_seen boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.portfolio_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES public.provider_portfolios(id) ON DELETE SET NULL,
  portfolio_title text NOT NULL,
  portfolio_category text,
  price numeric NOT NULL DEFAULT 0,
  buyer_name text,
  buyer_email text NOT NULL,
  buyer_phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state_region text,
  postal_code text,
  country text,
  order_notes text,
  payment_method text NOT NULL,
  payment_reference text NOT NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  is_seen boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create portfolio orders" ON public.portfolio_orders;
CREATE POLICY "Anyone can create portfolio orders"
ON public.portfolio_orders
FOR INSERT
TO public
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));

DROP POLICY IF EXISTS "Users can view their own portfolio orders" ON public.portfolio_orders;
CREATE POLICY "Users can view their own portfolio orders"
ON public.portfolio_orders
FOR SELECT
TO public
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all portfolio orders" ON public.portfolio_orders;
CREATE POLICY "Admins can view all portfolio orders"
ON public.portfolio_orders
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update portfolio orders" ON public.portfolio_orders;
CREATE POLICY "Admins can update portfolio orders"
ON public.portfolio_orders
FOR UPDATE
TO public
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete portfolio orders" ON public.portfolio_orders;
CREATE POLICY "Admins can delete portfolio orders"
ON public.portfolio_orders
FOR DELETE
TO public
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_product_orders_order_id ON public.product_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON public.product_orders(status);
CREATE INDEX IF NOT EXISTS idx_domain_orders_status ON public.domain_orders(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_orders_status ON public.portfolio_orders(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_orders_user_id ON public.portfolio_orders(user_id);

ALTER TABLE public.admin_notifications
  DROP CONSTRAINT IF EXISTS admin_notifications_type_check;

ALTER TABLE public.admin_notifications
  ADD CONSTRAINT admin_notifications_type_check
  CHECK (
    type = ANY (
      ARRAY[
        'user_registration'::text,
        'product_order'::text,
        'domain_order'::text,
        'meeting_booking'::text,
        'contact'::text,
        'support_ticket'::text,
        'project'::text,
        'project_request'::text,
        'portfolio_order'::text
      ]
    )
  );

CREATE OR REPLACE FUNCTION public.notify_admin_new_portfolio_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Portfolio Order',
    'New portfolio order: ' || NEW.portfolio_title || ' by ' || COALESCE(NEW.buyer_name, NEW.buyer_email),
    'portfolio_order',
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contacts_admin_notification ON public.contacts;
CREATE TRIGGER contacts_admin_notification
AFTER INSERT ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_contact();

DROP TRIGGER IF EXISTS product_orders_admin_notification ON public.product_orders;
CREATE TRIGGER product_orders_admin_notification
AFTER INSERT ON public.product_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_product_order();

DROP TRIGGER IF EXISTS domain_orders_admin_notification ON public.domain_orders;
CREATE TRIGGER domain_orders_admin_notification
AFTER INSERT ON public.domain_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_domain_order();

DROP TRIGGER IF EXISTS meeting_bookings_admin_notification ON public.meeting_bookings;
CREATE TRIGGER meeting_bookings_admin_notification
AFTER INSERT ON public.meeting_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_meeting_booking();

DROP TRIGGER IF EXISTS profiles_admin_notification ON public.profiles;
CREATE TRIGGER profiles_admin_notification
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_user();

DROP TRIGGER IF EXISTS portfolio_orders_admin_notification ON public.portfolio_orders;
CREATE TRIGGER portfolio_orders_admin_notification
AFTER INSERT ON public.portfolio_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_portfolio_order();