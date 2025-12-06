-- Add provider_payment_requested column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS provider_payment_requested boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS provider_payment_status text DEFAULT 'pending';

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.profiles;
CREATE POLICY "Admins can delete user profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete product orders" ON public.product_orders;
CREATE POLICY "Admins can delete product orders"
ON public.product_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete domain orders" ON public.domain_orders;
CREATE POLICY "Admins can delete domain orders"
ON public.domain_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete favorites" ON public.favorites;
CREATE POLICY "Admins can delete favorites"
ON public.favorites
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete cart items" ON public.cart_items;
CREATE POLICY "Admins can delete cart items"
ON public.cart_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete chat messages" ON public.chat_messages;
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete friend requests" ON public.friend_requests;
CREATE POLICY "Admins can delete friend requests"
ON public.friend_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete login sessions" ON public.login_sessions;
CREATE POLICY "Admins can delete login sessions"
ON public.login_sessions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete project messages" ON public.project_messages;
CREATE POLICY "Admins can delete project messages"
ON public.project_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete user notifications" ON public.user_notifications;
CREATE POLICY "Admins can delete user notifications"
ON public.user_notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete user purchases" ON public.user_purchases;
CREATE POLICY "Admins can delete user purchases"
ON public.user_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));