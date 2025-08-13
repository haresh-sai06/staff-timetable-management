-- Create separate timetable tables for each year
CREATE TABLE public.timetable_year_1 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code text,
  staff_id uuid,
  classroom_id uuid,
  department text NOT NULL,
  semester text NOT NULL,
  student_group text NOT NULL,
  day text NOT NULL,
  time_slot text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_time_slot_year_1 UNIQUE (department, semester, day, time_slot, student_group)
);

CREATE TABLE public.timetable_year_2 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code text,
  staff_id uuid,
  classroom_id uuid,
  department text NOT NULL,
  semester text NOT NULL,
  student_group text NOT NULL,
  day text NOT NULL,
  time_slot text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_time_slot_year_2 UNIQUE (department, semester, day, time_slot, student_group)
);

CREATE TABLE public.timetable_year_3 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code text,
  staff_id uuid,
  classroom_id uuid,
  department text NOT NULL,
  semester text NOT NULL,
  student_group text NOT NULL,
  day text NOT NULL,
  time_slot text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_time_slot_year_3 UNIQUE (department, semester, day, time_slot, student_group)
);

CREATE TABLE public.timetable_year_4 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code text,
  staff_id uuid,
  classroom_id uuid,
  department text NOT NULL,
  semester text NOT NULL,
  student_group text NOT NULL,
  day text NOT NULL,
  time_slot text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_time_slot_year_4 UNIQUE (department, semester, day, time_slot, student_group)
);

-- Enable RLS on all year-specific timetable tables
ALTER TABLE public.timetable_year_1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_year_2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_year_3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_year_4 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for year-specific tables
CREATE POLICY "Allow authenticated read access to timetable_year_1" 
ON public.timetable_year_1 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to timetable_year_1" 
ON public.timetable_year_1 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Allow authenticated read access to timetable_year_2" 
ON public.timetable_year_2 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to timetable_year_2" 
ON public.timetable_year_2 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Allow authenticated read access to timetable_year_3" 
ON public.timetable_year_3 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to timetable_year_3" 
ON public.timetable_year_3 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Allow authenticated read access to timetable_year_4" 
ON public.timetable_year_4 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to timetable_year_4" 
ON public.timetable_year_4 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Update subjects table to include year separation
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS academic_year text;

-- Update tutor_assignments to use years instead of semesters
ALTER TABLE public.tutor_assignments DROP COLUMN IF EXISTS semester;
ALTER TABLE public.tutor_assignments ADD COLUMN year_group text NOT NULL DEFAULT '1st Year';

-- Add year column to subjects if not exists
UPDATE public.subjects SET academic_year = '2024-2028' WHERE academic_year IS NULL;