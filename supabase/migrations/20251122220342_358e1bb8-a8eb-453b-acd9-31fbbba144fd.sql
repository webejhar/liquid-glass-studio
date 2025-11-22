-- Create notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user_registration', 'product_order', 'domain_order', 'meeting_booking')),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Allow admins to view notifications
CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, reference_id)
  VALUES (p_title, p_message, p_type, p_reference_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for new user registration
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New User Registration',
    'New user registered: ' || COALESCE(NEW.name, NEW.email, 'Unknown'),
    'user_registration',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger for new profiles
CREATE TRIGGER notify_admin_on_new_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_user();

-- Trigger function for new product order
CREATE OR REPLACE FUNCTION public.notify_admin_new_product_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Product Order',
    'New order for: ' || NEW.product_name || ' by ' || COALESCE(NEW.buyer_name, NEW.buyer_email),
    'product_order',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger for new product orders
CREATE TRIGGER notify_admin_on_new_product_order
AFTER INSERT ON public.product_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_product_order();

-- Trigger function for new domain order
CREATE OR REPLACE FUNCTION public.notify_admin_new_domain_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Domain Order',
    'New domain order: ' || NEW.domain_name || ' by ' || COALESCE(NEW.buyer_name, NEW.buyer_email),
    'domain_order',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger for new domain orders
CREATE TRIGGER notify_admin_on_new_domain_order
AFTER INSERT ON public.domain_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_domain_order();

-- Trigger function for new meeting booking
CREATE OR REPLACE FUNCTION public.notify_admin_new_meeting_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Meeting Booking',
    'New meeting booked by ' || NEW.name || ' on ' || NEW.meeting_date || ' at ' || NEW.meeting_time,
    'meeting_booking',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger for new meeting bookings
CREATE TRIGGER notify_admin_on_new_meeting_booking
AFTER INSERT ON public.meeting_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_meeting_booking();