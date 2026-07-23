DO $$
DECLARE
  v_new_identity_data jsonb;
  v_seeded_identity_data jsonb;
BEGIN
  SELECT identity_data INTO v_new_identity_data FROM auth.identities WHERE email = 'test_new_user@demo.com';
  SELECT identity_data INTO v_seeded_identity_data FROM auth.identities WHERE email = 'admin@demo.com';
  
  INSERT INTO public.debug_log (msg) VALUES ('new identity_data: ' || COALESCE(v_new_identity_data::text, 'NULL'));
  INSERT INTO public.debug_log (msg) VALUES ('seeded identity_data: ' || COALESCE(v_seeded_identity_data::text, 'NULL'));
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
