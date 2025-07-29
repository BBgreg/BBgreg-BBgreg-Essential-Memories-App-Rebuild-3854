-- Add is_premium column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
    
    -- Add comment
    COMMENT ON COLUMN public.profiles.is_premium IS 'Indicates if user has premium subscription';
    
    -- Log to console
    RAISE NOTICE 'Added is_premium column to profiles table';
  ELSE
    RAISE NOTICE 'is_premium column already exists in profiles table';
  END IF;
END $$;

-- Update any existing stripe_customer_id users to have premium
UPDATE public.profiles
SET is_premium = true
WHERE stripe_customer_id IS NOT NULL AND stripe_customer_id != '';

-- Create RLS policy to allow users to read their own premium status
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their own premium status" ON public.profiles;
  
  CREATE POLICY "Users can read their own premium status" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);
  
  RAISE NOTICE 'Created RLS policy for premium status';
END $$;