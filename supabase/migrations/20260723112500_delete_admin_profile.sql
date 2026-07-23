DO $$
BEGIN
  DELETE FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@demo.com');
  INSERT INTO public.debug_log (msg) VALUES ('deleted profile for admin');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error deleting profile: ' || SQLERRM);
END;
$$;
