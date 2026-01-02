-- Add logo_url column to bus_operators table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bus_operators' 
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.bus_operators 
    ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- Update the get_bus_operators_by_ids function to include logo_url
DROP FUNCTION IF EXISTS public.get_bus_operators_by_ids(uuid[]);

CREATE OR REPLACE FUNCTION public.get_bus_operators_by_ids(p_operator_ids uuid[])
RETURNS TABLE(id uuid, status operator_status, company_name character varying, logo_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bo.id,
    bo.status::operator_status,
    bo.company_name::VARCHAR(255),
    bo.logo_url
  FROM public.bus_operators bo
  WHERE bo.id = ANY(p_operator_ids);
END;
$$;

