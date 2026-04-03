
-- Fix: Allow system/trigger inserts into admin_notifications
CREATE POLICY "System can insert admin notifications"
ON public.admin_notifications FOR INSERT
TO public
WITH CHECK (true);
