-- 1. Ensure all existing users have a profile entry
-- This fixes the issue where old users might not have a public profile row
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, split_part(email, '@', 1) 
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Update Item table to reference Profiles correctly for API joins
-- This allows the 'profiles(full_name)' join to work in the Next.js code
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;
ALTER TABLE public.items 
  ADD CONSTRAINT items_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 3. Update Messages table to reference Profiles correctly
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 4. Verify RLS policies are broad enough for public viewing of profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);
