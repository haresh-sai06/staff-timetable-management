
-- Add avatar_url column to profiles table for storing profile pictures
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;
