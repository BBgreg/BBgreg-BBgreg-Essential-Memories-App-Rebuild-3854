-- Add ON DELETE CASCADE to practice_sessions_esm1234567 table
-- First, drop the existing foreign key constraint
ALTER TABLE public.practice_sessions_esm1234567
DROP CONSTRAINT IF EXISTS practice_sessions_esm1234567_date_id_fkey;

-- Then, add the foreign key constraint back with ON DELETE CASCADE
ALTER TABLE public.practice_sessions_esm1234567
ADD CONSTRAINT practice_sessions_esm1234567_date_id_fkey
FOREIGN KEY (date_id) REFERENCES public.dates_esm1234567(id) ON DELETE CASCADE;

-- Log the change for future reference
COMMENT ON CONSTRAINT practice_sessions_esm1234567_date_id_fkey ON public.practice_sessions_esm1234567 IS 'Foreign key to dates_esm1234567 with ON DELETE CASCADE to allow memory deletion';