-- Allow users to view other users' public profile information for friend search and chat
CREATE POLICY "Users can view other users public profiles"
ON public.profiles
FOR SELECT
USING (true);

-- This allows all authenticated users to see basic profile information of other users
-- which is necessary for:
-- 1. Searching for friends by name or account number
-- 2. Viewing friend profiles in chat
-- 3. Displaying friend information in the friend list