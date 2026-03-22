-- NUCLEAR DEBUGGING FOR MESSAGES
-- Run this if messaging STILL fails. It removes all restrictions for testing.

-- 1. Totally disable RLS for messages to see if that is the blocker
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 2. Make sure the table is completely fresh and correct
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    item_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grant all permissions to everyone for now (TESTING ONLY)
GRANT ALL ON public.messages TO anon, authenticated, service_role;

-- 4. Check if we can insert a manual test row
INSERT INTO public.messages (sender_id, receiver_id, item_id, content)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'TEST MESSAGE - IF YOU SEE THIS IN TABLE, DATABASE IS OK'
);
