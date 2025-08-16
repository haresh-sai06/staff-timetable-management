-- Create separate tables for different semesters and departments
-- Add semester and department columns if missing, and create indexes for better performance

-- First, add missing columns to existing timetable year tables if they don't exist
-- Add semester column to all timetable_year tables
DO $$
BEGIN
    -- For timetable_year_1
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timetable_year_1' AND column_name='semester') THEN
        ALTER TABLE public.timetable_year_1 ADD COLUMN semester text NOT NULL DEFAULT 'odd';
    END IF;
    
    -- For timetable_year_2
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timetable_year_2' AND column_name='semester') THEN
        ALTER TABLE public.timetable_year_2 ADD COLUMN semester text NOT NULL DEFAULT 'odd';
    END IF;
    
    -- For timetable_year_3
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timetable_year_3' AND column_name='semester') THEN
        ALTER TABLE public.timetable_year_3 ADD COLUMN semester text NOT NULL DEFAULT 'odd';
    END IF;
    
    -- For timetable_year_4
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timetable_year_4' AND column_name='semester') THEN
        ALTER TABLE public.timetable_year_4 ADD COLUMN semester text NOT NULL DEFAULT 'odd';
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timetable_year_1_dept_sem ON public.timetable_year_1(department, semester);
CREATE INDEX IF NOT EXISTS idx_timetable_year_2_dept_sem ON public.timetable_year_2(department, semester);
CREATE INDEX IF NOT EXISTS idx_timetable_year_3_dept_sem ON public.timetable_year_3(department, semester);
CREATE INDEX IF NOT EXISTS idx_timetable_year_4_dept_sem ON public.timetable_year_4(department, semester);

-- Add foreign key constraints to ensure data integrity
ALTER TABLE public.timetable_year_1 
ADD CONSTRAINT fk_timetable_year_1_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_1 
ADD CONSTRAINT fk_timetable_year_1_classroom 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_2 
ADD CONSTRAINT fk_timetable_year_2_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_2 
ADD CONSTRAINT fk_timetable_year_2_classroom 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_3 
ADD CONSTRAINT fk_timetable_year_3_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_3 
ADD CONSTRAINT fk_timetable_year_3_classroom 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_4 
ADD CONSTRAINT fk_timetable_year_4_staff 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.timetable_year_4 
ADD CONSTRAINT fk_timetable_year_4_classroom 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL;