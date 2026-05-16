
-- 1) Restrict public exposure of profiles PII
DROP POLICY IF EXISTS "Users can view other users public profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) Restrict platform_settings to authenticated users only
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;

CREATE POLICY "Authenticated users can view platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (true);
