
-- Create profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'faculty', 'user')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert admin user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create staff table for staff management
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Prof', 'AsstProf', 'AssocProf')),
  max_hours INTEGER DEFAULT 18,
  current_hours INTEGER DEFAULT 0,
  subjects TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Anyone can view staff" ON public.staff
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage staff" ON public.staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample staff data
INSERT INTO public.staff (name, email, department, role, max_hours, current_hours, subjects) VALUES
('Dr. Priya Sharma', 'priya.sharma@university.edu', 'CSE', 'AsstProf', 18, 15, '{"Data Structures", "Algorithms", "Database Management"}'),
('Prof. Rajesh Kumar', 'rajesh.kumar@university.edu', 'CSE', 'Prof', 12, 10, '{"Computer Networks", "Operating Systems"}'),
('Dr. Anitha Reddy', 'anitha.reddy@university.edu', 'ECE', 'AsstProf', 18, 16, '{"Digital Electronics", "Communication Systems"}'),
('Prof. Suresh Nair', 'suresh.nair@university.edu', 'MECH', 'Prof', 12, 8, '{"Thermodynamics", "Fluid Mechanics"}');
