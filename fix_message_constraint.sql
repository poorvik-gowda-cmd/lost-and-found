-- FIX FOR DUPLICATE KEY ERROR
-- This removes the accidental unique constraint that prevents multiple messages per item.

-- 1. Drop the problematic constraint
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_item_id_key;

-- 2. Double check: Ensure no other unique constraints on item_id exist
-- (Sometimes it might have a different name)
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_item_id_unique;

-- 3. Verify the table is set for multiple messages
-- This is already correct if the constraint is gone.
