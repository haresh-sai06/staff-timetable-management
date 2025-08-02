-- First, let's update the subjects table to support multiple departments
ALTER TABLE public.subjects 
ADD COLUMN departments TEXT[];

-- Update existing records to use the new departments array
UPDATE public.subjects 
SET departments = ARRAY[department]
WHERE departments IS NULL;

-- Update subject types to only have lecture and lab
UPDATE public.subjects 
SET type = 'lecture' 
WHERE type NOT IN ('lecture', 'lab');

-- Insert sample classrooms if they don't exist
INSERT INTO public.classrooms (name, type, capacity, department, building, floor, facilities, is_active)
SELECT 
  'CSE-101', 'lecture', 60, 'CSE', 'Main Building', 1, ARRAY['Projector', 'Audio System', 'Whiteboard'], true
WHERE NOT EXISTS (SELECT 1 FROM public.classrooms WHERE name = 'CSE-101');

INSERT INTO public.classrooms (name, type, capacity, department, building, floor, facilities, is_active)
SELECT 
  'CSE-Lab1', 'lab', 30, 'CSE', 'Lab Building', 2, ARRAY['30 Computers', 'Server', 'Network Equipment'], true
WHERE NOT EXISTS (SELECT 1 FROM public.classrooms WHERE name = 'CSE-Lab1');

INSERT INTO public.classrooms (name, type, capacity, department, building, floor, facilities, is_active)
SELECT 
  'ECE-201', 'lecture', 45, 'ECE', 'Main Building', 2, ARRAY['Smart Board', 'Audio System'], true
WHERE NOT EXISTS (SELECT 1 FROM public.classrooms WHERE name = 'ECE-201');

INSERT INTO public.classrooms (name, type, capacity, department, building, floor, facilities, is_active)
SELECT 
  'MECH-Workshop', 'lab', 25, 'MECH', 'Workshop Building', 1, ARRAY['Lathe Machines', 'Drilling Machines', 'Safety Equipment'], true
WHERE NOT EXISTS (SELECT 1 FROM public.classrooms WHERE name = 'MECH-Workshop');

INSERT INTO public.classrooms (name, type, capacity, department, building, floor, facilities, is_active)
SELECT 
  'Seminar-Hall', 'lecture', 150, 'General', 'Main Building', 3, ARRAY['Stage', 'Audio-Visual', 'Air Conditioning'], true
WHERE NOT EXISTS (SELECT 1 FROM public.classrooms WHERE name = 'Seminar-Hall');