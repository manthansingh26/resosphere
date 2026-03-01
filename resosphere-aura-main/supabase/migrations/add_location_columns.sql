-- Add location columns to vibes table for accurate geolocation
-- Migration: Add latitude, longitude, and location_name columns

-- Add latitude column (nullable for backward compatibility)
ALTER TABLE public.vibes 
ADD COLUMN IF NOT EXISTS latitude float8;

-- Add longitude column (nullable for backward compatibility)
ALTER TABLE public.vibes 
ADD COLUMN IF NOT EXISTS longitude float8;

-- Add location_name column for human-readable location
ALTER TABLE public.vibes 
ADD COLUMN IF NOT EXISTS location_name text;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS vibes_location_idx 
ON public.vibes(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.vibes.latitude IS 'GPS latitude coordinate from user device';
COMMENT ON COLUMN public.vibes.longitude IS 'GPS longitude coordinate from user device';
COMMENT ON COLUMN public.vibes.location_name IS 'Human-readable location name (e.g., "Mumbai, India")';
