DO $$
BEGIN
  -- Recreate admin profile correctly
  INSERT INTO public.profiles (id, first_name, last_name, role)
  SELECT id, 'Admin', 'User', 'admin'
  FROM auth.users
  WHERE email = 'admin@demo.com'
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.debug_log (msg) VALUES ('Recreated admin profile');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error recreating profile: ' || SQLERRM);
END;
$$;
