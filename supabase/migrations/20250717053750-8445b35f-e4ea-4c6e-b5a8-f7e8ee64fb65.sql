
-- Create table for tutor-classroom assignments
CREATE TABLE public.tutor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  classroom TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(classroom, department, academic_year, semester)
);

-- Add RLS policies for tutor assignments
ALTER TABLE public.tutor_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing tutor assignments
CREATE POLICY "Anyone can view tutor assignments" 
  ON public.tutor_assignments 
  FOR SELECT 
  USING (true);

-- Policy for managing tutor assignments (admin only)
CREATE POLICY "Only admins can manage tutor assignments" 
  ON public.tutor_assignments 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Create table for classroom management
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL DEFAULT 'lecture' CHECK (type IN ('lecture', 'lab', 'seminar')),
  floor INTEGER,
  building TEXT,
  facilities TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, department)
);

-- Add RLS policies for classrooms
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Policy for viewing classrooms
CREATE POLICY "Anyone can view classrooms" 
  ON public.classrooms 
  FOR SELECT 
  USING (true);

-- Policy for managing classrooms (admin only)
CREATE POLICY "Only admins can manage classrooms" 
  ON public.classrooms 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Create table for timetable entries
CREATE TABLE public.timetable_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  student_group TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'lab', 'tutorial', 'seminar')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT no_time_overlap UNIQUE (classroom_id, day_of_week, start_time, end_time, semester, academic_year)
);

-- Add RLS policies for timetable entries
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Policy for viewing timetable entries
CREATE POLICY "Anyone can view timetable entries" 
  ON public.timetable_entries 
  FOR SELECT 
  USING (true);

-- Policy for managing timetable entries (admin and faculty)
CREATE POLICY "Admins and faculty can manage timetable entries" 
  ON public.timetable_entries 
  FOR ALL 
  USING (get_current_user_role() IN ('admin', 'faculty'));

-- Create audit log table for tracking changes
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Add RLS policy for audit logs (admin only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

-- Create function to log changes
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for audit logging on critical tables
CREATE TRIGGER staff_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER tutor_assignments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tutor_assignments
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER timetable_entries_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.timetable_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Create function for enhanced role checking with caching
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  role TEXT,
  department TEXT,
  can_manage_staff BOOLEAN,
  can_manage_timetables BOOLEAN,
  can_view_reports BOOLEAN,
  can_manage_classrooms BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to validate staff workload
CREATE OR REPLACE FUNCTION public.validate_staff_workload(
  staff_id UUID,
  additional_hours INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check classroom availability
CREATE OR REPLACE FUNCTION public.is_classroom_available(
  classroom_id UUID,
  day TEXT,
  start_time TIME,
  end_time TIME,
  semester TEXT,
  academic_year TEXT,
  exclude_entry_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add indexes for better performance
CREATE INDEX idx_tutor_assignments_staff_id ON public.tutor_assignments(staff_id);
CREATE INDEX idx_tutor_assignments_classroom ON public.tutor_assignments(classroom, department);
CREATE INDEX idx_timetable_entries_staff_id ON public.timetable_entries(staff_id);
CREATE INDEX idx_timetable_entries_classroom_id ON public.timetable_entries(classroom_id);
CREATE INDEX idx_timetable_entries_schedule ON public.timetable_entries(day_of_week, start_time, end_time);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
