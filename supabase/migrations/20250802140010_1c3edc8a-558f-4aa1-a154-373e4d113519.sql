-- Fix RLS issues by enabling RLS on tables that have policies but RLS disabled
-- Based on the linter errors, we need to enable RLS on tables with existing policies

-- Enable RLS on all tables in public schema that don't have it enabled
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Update database functions to have proper search_path for security
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    old_values,
    new_values,
    user_id,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    auth.email()
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(role text, department text, can_manage_staff boolean, can_manage_timetables boolean, can_view_reports boolean, can_manage_classrooms boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.role,
    p.department,
    CASE WHEN p.role = 'admin' THEN true ELSE false END as can_manage_staff,
    CASE WHEN p.role IN ('admin', 'faculty') THEN true ELSE false END as can_manage_timetables,
    CASE WHEN p.role IN ('admin', 'faculty') THEN true ELSE false END as can_view_reports,
    CASE WHEN p.role = 'admin' THEN true ELSE false END as can_manage_classrooms
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_staff_workload(staff_id uuid, additional_hours integer DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_total INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT 
    COALESCE(s.current_hours, 0) + additional_hours,
    s.max_hours
  INTO current_total, max_allowed
  FROM public.staff s
  WHERE s.id = staff_id;
  
  RETURN current_total <= max_allowed;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_classroom_available(classroom_id uuid, day text, start_time time without time zone, end_time time without time zone, semester text, academic_year text, exclude_entry_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.timetable_entries te
    WHERE te.classroom_id = is_classroom_available.classroom_id
      AND te.day_of_week = day
      AND te.semester = is_classroom_available.semester
      AND te.academic_year = is_classroom_available.academic_year
      AND te.is_active = true
      AND (exclude_entry_id IS NULL OR te.id != exclude_entry_id)
      AND (
        (start_time >= te.start_time AND start_time < te.end_time)
        OR (end_time > te.start_time AND end_time <= te.end_time)
        OR (start_time <= te.start_time AND end_time >= te.end_time)
      )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'
      WHEN NEW.email LIKE '%faculty%' THEN 'faculty'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;