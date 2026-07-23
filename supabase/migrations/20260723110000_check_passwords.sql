DO $$
DECLARE
  v_seeded_pw text;
  v_new_pw text;
BEGIN
  SELECT encrypted_password INTO v_seeded_pw FROM auth.users WHERE email = 'admin@demo.com';
  SELECT encrypted_password INTO v_new_pw FROM auth.users WHERE email = 'test_new_user@demo.com';
  
  INSERT INTO public.debug_log (msg) VALUES ('seeded pw: ' || COALESCE(v_seeded_pw, 'NULL'));
  INSERT INTO public.debug_log (msg) VALUES ('new pw: ' || COALESCE(v_new_pw, 'NULL'));
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
