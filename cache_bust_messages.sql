-- THE ULTIMATE CACHE-BUSTING FIX
-- This renames the columns to force Supabase to refresh its knowledge.

-- 1. Wipe the old table completely
DROP TABLE IF EXISTS public.messages CASCADE;

-- 2. Create with NEW column names (from_id and to_id)
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.items ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Permissions (Simplest possible for testing)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view their own" ON public.messages 
FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Anyone can send" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- 4. Grant access
GRANT ALL ON public.messages TO anon, authenticated, service_role;
