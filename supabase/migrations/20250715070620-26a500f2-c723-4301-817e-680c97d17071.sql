
-- First, let's fix the infinite recursion issue by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Also fix the staff table policy
DROP POLICY IF EXISTS "Only admins can manage staff" ON public.staff;

CREATE POLICY "Only admins can manage staff" ON public.staff
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Ensure profiles table has INSERT policy for new users
CREATE POLICY "Allow insert during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Make sure email confirmation is not required for easier testing
-- This needs to be done in Supabase dashboard: Authentication > Settings > "Enable email confirmations" should be OFF
