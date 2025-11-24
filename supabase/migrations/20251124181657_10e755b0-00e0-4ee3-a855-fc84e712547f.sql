
-- Create user_notifications table for order/verification updates
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (true);

-- Create login_sessions table for device tracking
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_type TEXT,
  device_model TEXT,
  browser_name TEXT,
  browser_version TEXT,
  ip_address TEXT,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on login_sessions
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.login_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own sessions (logout)
CREATE POLICY "Users can update their own sessions"
ON public.login_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert sessions
CREATE POLICY "System can insert sessions"
ON public.login_sessions
FOR INSERT
WITH CHECK (true);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.login_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create user notification
CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_user_id UUID,
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
  INSERT INTO public.user_notifications (user_id, title, message, type, reference_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_reference_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger to notify user when order status changes
CREATE OR REPLACE FUNCTION notify_user_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Try to find user_id from the order
    IF NEW.user_id IS NOT NULL THEN
      PERFORM create_user_notification(
        NEW.user_id,
        'Order Status Updated',
        'Your order status has been changed to: ' || NEW.status,
        'order_status',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for order status changes
DROP TRIGGER IF EXISTS product_order_status_change ON public.product_orders;
CREATE TRIGGER product_order_status_change
AFTER UPDATE ON public.product_orders
FOR EACH ROW
EXECUTE FUNCTION notify_user_order_status_change();

DROP TRIGGER IF EXISTS domain_order_status_change ON public.domain_orders;
CREATE TRIGGER domain_order_status_change
AFTER UPDATE ON public.domain_orders
FOR EACH ROW
EXECUTE FUNCTION notify_user_order_status_change();

-- Trigger to notify user when verification status changes
CREATE OR REPLACE FUNCTION notify_user_verification_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if verification status changed
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    PERFORM create_user_notification(
      NEW.user_id,
      'Verification Status Updated',
      'Your verification status has been changed to: ' || NEW.verification_status,
      'verification_status',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for verification status changes
DROP TRIGGER IF EXISTS profile_verification_status_change ON public.profiles;
CREATE TRIGGER profile_verification_status_change
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION notify_user_verification_status_change();

-- Enable realtime for user_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
