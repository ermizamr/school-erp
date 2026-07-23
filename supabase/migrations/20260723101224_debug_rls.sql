CREATE OR REPLACE FUNCTION public.debug_get_all_profiles()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_agg(p.*) FROM public.profiles p;
$$;
