-- Security Fix Migration: Address Critical Vulnerabilities
-- Phase 1: Fix Critical Issues (Corrected)

-- 1. Fix Staff Data Exposure
-- Remove the overly permissive "Anyone can view staff" policy
DROP POLICY IF EXISTS "Anyone can view staff" ON public.staff;

-- Check if "Authenticated users can view staff" policy exists and create if not
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

-- 2. Prevent Role Escalation in Profiles
-- Drop existing update policy and recreate with role protection
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that prevents role changes
CREATE POLICY "Users can update their own profile except role" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

-- Create separate admin-only policy for role management
CREATE POLICY "Admins can update any profile including roles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 3. Standardize and Clean Up Classroom Policies
-- Remove conflicting policies that use direct SELECT
DROP POLICY IF EXISTS "Allow admin write access to classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Allow authenticated read access to classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Allow insert access to classrooms" ON public.classrooms;

-- 4. Standardize Subject Policies  
-- Remove old policy using direct SELECT
DROP POLICY IF EXISTS "Allow admin write access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow authenticated read access to subjects" ON public.subjects;

-- 5. Standardize Timetable Entry Policies
-- Remove old policies using direct SELECT
DROP POLICY IF EXISTS "Allow admin write access to timetable_entries" ON public.timetable_entries;
DROP POLICY IF EXISTS "Allow authenticated read access to timetable_entries" ON public.timetable_entries;

-- Create standardized policies for timetable_entries
DO $$
BEGIN
    -- Check if view policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'timetable_entries' 
        AND policyname = 'Anyone can view timetable entries'
    ) THEN
        EXECUTE 'CREATE POLICY "Anyone can view timetable entries" 
                 ON public.timetable_entries 
                 FOR SELECT 
                 TO authenticated
                 USING (true)';
    END IF;

    -- Check if admin policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'timetable_entries' 
        AND policyname = 'Only admins can manage timetable entries'
    ) THEN
        EXECUTE 'CREATE POLICY "Only admins can manage timetable entries" 
                 ON public.timetable_entries 
                 FOR ALL 
                 TO authenticated
                 USING (get_current_user_role() = ''admin'')
                 WITH CHECK (get_current_user_role() = ''admin'')';
    END IF;
END $$;

-- 6. Add audit trigger for security-sensitive profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes specifically
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      old_values,
      new_values,
      user_id
    ) VALUES (
      'profiles',
      'ROLE_CHANGE',
      json_build_object('old_role', OLD.role),
      json_build_object('new_role', NEW.role),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile role changes
DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();