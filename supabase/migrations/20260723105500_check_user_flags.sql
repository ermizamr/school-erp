DO $$
DECLARE
  v_sso boolean;
  v_super boolean;
  v_seeded_sso boolean;
BEGIN
  SELECT is_sso_user, is_super_admin INTO v_sso, v_super FROM auth.users WHERE email = 'test_new_user@demo.com';
  SELECT is_sso_user INTO v_seeded_sso FROM auth.users WHERE email = 'admin@demo.com';
  INSERT INTO public.debug_log (msg) VALUES ('new user sso: ' || COALESCE(v_sso::text, 'NULL') || ', super: ' || COALESCE(v_super::text, 'NULL') || ', seeded sso: ' || COALESCE(v_seeded_sso::text, 'NULL'));
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
