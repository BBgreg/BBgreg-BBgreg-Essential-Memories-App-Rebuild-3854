-- Ensure streak_data_esm1234567 table exists and has required fields
DO $$ 
BEGIN
    -- Create streak_data_esm1234567 table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'streak_data_esm1234567'
    ) THEN
        CREATE TABLE public.streak_data_esm1234567 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            qotd_current_streak INTEGER DEFAULT 0,
            qotd_all_time_high INTEGER DEFAULT 0,
            last_qotd_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id)
        );
        
        -- Add comment
        COMMENT ON TABLE public.streak_data_esm1234567 IS 'Stores user streak information for Question of the Day and other features';
    ELSE
        -- Check if last_qotd_date column exists, if not add it
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'streak_data_esm1234567' AND column_name = 'last_qotd_date'
        ) THEN
            ALTER TABLE public.streak_data_esm1234567 
            ADD COLUMN last_qotd_date DATE;
        END IF;
    END IF;

    -- Ensure we have practice_sessions_esm1234567 table
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'practice_sessions_esm1234567'
    ) THEN
        CREATE TABLE public.practice_sessions_esm1234567 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            date_id UUID NOT NULL REFERENCES public.dates_esm1234567(id) ON DELETE CASCADE,
            correct BOOLEAN NOT NULL,
            session_type TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Add comment
        COMMENT ON TABLE public.practice_sessions_esm1234567 IS 'Records user practice sessions for memories';
    END IF;
END $$;

-- Enable RLS on streak_data_esm1234567
ALTER TABLE public.streak_data_esm1234567 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for streak_data_esm1234567
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own streak data" ON public.streak_data_esm1234567;
    DROP POLICY IF EXISTS "Users can update own streak data" ON public.streak_data_esm1234567;
    DROP POLICY IF EXISTS "Users can insert own streak data" ON public.streak_data_esm1234567;

    -- Create policies
    CREATE POLICY "Users can view own streak data" 
    ON public.streak_data_esm1234567 FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own streak data" 
    ON public.streak_data_esm1234567 FOR UPDATE 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own streak data" 
    ON public.streak_data_esm1234567 FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Enable RLS on practice_sessions_esm1234567
ALTER TABLE public.practice_sessions_esm1234567 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practice_sessions_esm1234567
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own practice sessions" ON public.practice_sessions_esm1234567;
    DROP POLICY IF EXISTS "Users can insert own practice sessions" ON public.practice_sessions_esm1234567;

    -- Create policies
    CREATE POLICY "Users can view own practice sessions" 
    ON public.practice_sessions_esm1234567 FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own practice sessions" 
    ON public.practice_sessions_esm1234567 FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger for streak_data_esm1234567
DROP TRIGGER IF EXISTS update_streak_data_updated_at ON public.streak_data_esm1234567;
CREATE TRIGGER update_streak_data_updated_at
    BEFORE UPDATE ON public.streak_data_esm1234567
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();