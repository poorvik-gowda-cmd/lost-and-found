-- THE ULTIMATE PROFILE TRIGGER
-- This ensures that every time a user signs up, a profile is created INSTANTLY.
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill missing profiles one more time
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. FINAL CHECK ON MESSAGES TABLE
-- Make sure it allows NULL receiver_id if needed? No, sebaiknya NOT NULL.
-- But let's check the Item owner.
-- Ensure the items own user_id is definitely in the profiles table.
INSERT INTO public.profiles (id, email)
SELECT user_id, 'legacy_owner@example.com' 
FROM public.items 
ON CONFLICT (id) DO NOTHING;
