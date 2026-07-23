DO $$
DECLARE
  v_role text;
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM public.profiles WHERE email = 'admin@demo.com';
  
  -- Test get_my_role
  -- We have to set auth.uid() manually for the session, which isn't easy in DO block.
  -- But we know the count of profiles.
  
  INSERT INTO public.debug_log (msg) VALUES ('Admin profiles count: ' || v_count);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
