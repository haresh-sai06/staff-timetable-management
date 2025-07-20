/*
  # Create subjects table with enhanced features

  1. New Tables
    - `subjects`
      - `id` (uuid, primary key)
      - `name` (text, subject name)
      - `code` (text, unique subject code)
      - `department` (text, department)
      - `credits` (integer, credit hours)
      - `type` (text, theory/lab/tutorial)
      - `lab_duration` (integer, for lab subjects - 2-4 periods)
      - `semester` (text, odd/even)
      - `year` (text, 1st/2nd/3rd/4th)
      - `is_active` (boolean)
      - `prerequisites` (text array, prerequisite subject codes)
      - `description` (text, subject description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subjects` table
    - Add policies for viewing and managing subjects
    - Add audit logging for subject changes

  3. Indexes
    - Add indexes for better performance on common queries
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  type TEXT NOT NULL DEFAULT 'theory' CHECK (type IN ('theory', 'lab', 'tutorial')),
  lab_duration INTEGER DEFAULT NULL CHECK (lab_duration IS NULL OR (lab_duration >= 2 AND lab_duration <= 4)),
  semester TEXT NOT NULL CHECK (semester IN ('odd', 'even')),
  year TEXT NOT NULL CHECK (year IN ('1st', '2nd', '3rd', '4th')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  prerequisites TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage subjects" ON public.subjects
  FOR ALL USING (get_current_user_role() = 'admin');

-- Add audit trigger
CREATE TRIGGER subjects_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_department ON public.subjects(department);
CREATE INDEX IF NOT EXISTS idx_subjects_type ON public.subjects(type);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_year ON public.subjects(semester, year);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(is_active);

-- Insert sample subjects data
INSERT INTO public.subjects (name, code, department, credits, type, lab_duration, semester, year, description) VALUES
-- CSE 1st Year Odd Semester
('Engineering Mathematics I', 'MA8151', 'CSE', 4, 'theory', NULL, 'odd', '1st', 'Differential and integral calculus, matrices, and vector algebra'),
('Engineering Physics', 'PH8151', 'CSE', 3, 'theory', NULL, 'odd', '1st', 'Mechanics, properties of matter, heat and thermodynamics'),
('Engineering Chemistry', 'CY8151', 'CSE', 3, 'theory', NULL, 'odd', '1st', 'Atomic structure, chemical bonding, and thermodynamics'),
('Programming in C', 'GE8151', 'CSE', 3, 'theory', NULL, 'odd', '1st', 'Introduction to programming concepts using C language'),
('Problem Solving and Python Programming', 'GE8161', 'CSE', 3, 'theory', NULL, 'odd', '1st', 'Problem solving techniques and Python programming'),
('Engineering Graphics', 'GE8152', 'CSE', 4, 'theory', NULL, 'odd', '1st', 'Technical drawing and computer-aided drafting'),
('Programming in C Laboratory', 'GE8161L', 'CSE', 2, 'lab', 2, 'odd', '1st', 'Hands-on programming practice in C language'),
('Python Programming Laboratory', 'GE8162L', 'CSE', 2, 'lab', 2, 'odd', '1st', 'Python programming lab exercises'),

-- CSE 2nd Year Odd Semester
('Discrete Mathematics', 'MA8351', 'CSE', 4, 'theory', NULL, 'odd', '2nd', 'Logic, sets, relations, functions, and graph theory'),
('Digital Principles and System Design', 'CS8351', 'CSE', 3, 'theory', NULL, 'odd', '2nd', 'Boolean algebra, combinational and sequential circuits'),
('Data Structures', 'CS8391', 'CSE', 3, 'theory', NULL, 'odd', '2nd', 'Arrays, linked lists, stacks, queues, trees, and graphs'),
('Computer Organization', 'CS8392', 'CSE', 3, 'theory', NULL, 'odd', '2nd', 'Computer architecture and organization principles'),
('Object Oriented Programming', 'CS8393', 'CSE', 3, 'theory', NULL, 'odd', '2nd', 'OOP concepts using Java programming language'),
('Data Structures Laboratory', 'CS8381L', 'CSE', 2, 'lab', 3, 'odd', '2nd', 'Implementation of data structures and algorithms'),
('Object Oriented Programming Laboratory', 'CS8383L', 'CSE', 2, 'lab', 3, 'odd', '2nd', 'Java programming lab exercises'),

-- CSE 3rd Year Odd Semester
('Probability and Statistics', 'MA8391', 'CSE', 4, 'theory', NULL, 'odd', '3rd', 'Probability theory and statistical methods'),
('Database Management Systems', 'CS8481', 'CSE', 3, 'theory', NULL, 'odd', '3rd', 'Database design, SQL, and transaction management'),
('Networks Laboratory', 'CS8461L', 'CSE', 2, 'lab', 3, 'odd', '3rd', 'Network programming and protocol implementation'),
('Database Management Systems Laboratory', 'CS8481L', 'CSE', 2, 'lab', 3, 'odd', '3rd', 'Database design and SQL programming'),
('Computer Networks', 'CS8591', 'CSE', 3, 'theory', NULL, 'odd', '3rd', 'Network protocols, TCP/IP, and network security'),
('Operating Systems', 'CS8492', 'CSE', 3, 'theory', NULL, 'odd', '3rd', 'Process management, memory management, and file systems'),

-- ECE Subjects
('Signals and Systems', 'EC8351', 'ECE', 4, 'theory', NULL, 'odd', '2nd', 'Continuous and discrete time signals and systems'),
('Electronic Devices and Circuits', 'EC8353', 'ECE', 3, 'theory', NULL, 'odd', '2nd', 'Semiconductor devices and basic electronic circuits'),
('Digital Electronics', 'EC8392', 'ECE', 3, 'theory', NULL, 'odd', '2nd', 'Digital logic design and combinational circuits'),
('Electronics Laboratory', 'EC8361L', 'ECE', 2, 'lab', 3, 'odd', '2nd', 'Electronic circuits and measurements'),
('Digital Electronics Laboratory', 'EC8362L', 'ECE', 2, 'lab', 3, 'odd', '2nd', 'Digital logic implementation and testing'),

-- MECH Subjects
('Engineering Thermodynamics', 'ME8391', 'MECH', 4, 'theory', NULL, 'odd', '2nd', 'Laws of thermodynamics and their applications'),
('Fluid Mechanics', 'ME8392', 'MECH', 4, 'theory', NULL, 'odd', '2nd', 'Fluid statics, dynamics, and flow measurements'),
('Manufacturing Technology', 'ME8393', 'MECH', 3, 'theory', NULL, 'odd', '2nd', 'Metal cutting, forming, and joining processes'),
('Manufacturing Laboratory', 'ME8381L', 'MECH', 2, 'lab', 4, 'odd', '2nd', 'Hands-on experience with manufacturing processes'),
('Fluid Mechanics Laboratory', 'ME8382L', 'MECH', 2, 'lab', 3, 'odd', '2nd', 'Fluid flow experiments and measurements');