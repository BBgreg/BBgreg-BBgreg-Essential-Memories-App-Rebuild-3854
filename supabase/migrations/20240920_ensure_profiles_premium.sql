-- Ensure profiles table has all required columns for premium functionality
DO $$ 
BEGIN
  -- Add is_premium column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Added is_premium column to profiles table';
  END IF;

  -- Add stripe_customer_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
    RAISE NOTICE 'Added stripe_customer_id column to profiles table';
  END IF;

  -- Add stripe_subscription_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
    RAISE NOTICE 'Added stripe_subscription_id column to profiles table';
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column to profiles table';
  END IF;

  -- Add free_poems_generated column if it doesn't exist (for backward compatibility)
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'free_poems_generated'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN free_poems_generated INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added free_poems_generated column to profiles table';
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

  -- Create comprehensive RLS policies
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

  CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  RAISE NOTICE 'Updated RLS policies for profiles table';
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    is_premium, 
    free_poems_generated,
    stripe_customer_id,
    stripe_subscription_id
  ) VALUES (
    NEW.id, 
    NEW.email, 
    false, 
    0,
    NULL,
    NULL
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.is_premium IS 'Indicates if user has active premium subscription';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for payment tracking';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe subscription ID for subscription tracking';

RAISE NOTICE 'Profiles table setup complete for premium functionality';