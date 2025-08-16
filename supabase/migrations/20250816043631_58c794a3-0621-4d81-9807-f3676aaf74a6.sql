-- Final Security Cleanup: Remove Conflicting Policies and Ensure Proper Setup

-- Clean up any conflicting duplicate policies by dropping them explicitly
-- and recreating only the ones we need

-- 1. Clean up profiles policies
DROP POLICY IF EXISTS "Users can update their own profile except role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile including roles" ON public.profiles;

-- Recreate profiles policies with proper role protection
CREATE POLICY "Users can update own profile excluding role" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Only admins can manage roles
CREATE POLICY "Admins can manage all profiles and roles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Ensure staff table has proper restrictions
-- Remove any overly permissive policies and ensure only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view staff" ON public.staff;

-- Ensure authenticated users policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'staff' 
        AND policyname = 'Authenticated users can view staff'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can view staff" 
                 ON public.staff 
                 FOR SELECT 
                 TO authenticated
                 USING (true)';
    END IF;
END $$;

-- 3. Add security constraints to prevent SQL injection and improve data integrity
-- Add check constraints for critical fields
DO $$
BEGIN
    -- Add constraint to ensure email format in profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_email_format'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    -- Add constraint to ensure valid roles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_valid_role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_valid_role 
        CHECK (role IN ('admin', 'faculty', 'user') OR role IS NULL);
    END IF;
END $$;

-- 4. Update search path for existing functions to be security definer
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 5. Create additional security function for permission checks
CREATE OR REPLACE FUNCTION public.check_admin_permission()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;