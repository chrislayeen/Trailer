-- Add comments column to photos table
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS comments TEXT;

-- Update RLS policies for photos (if needed, though already permissive for anon/authenticated)
-- Ensure 'Allow photo updates' for comments persistence
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'photos' AND policyname = 'Allow photo updates'
    ) THEN
        CREATE POLICY "Allow photo updates" ON public.photos FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;
