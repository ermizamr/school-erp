DO $$
DECLARE
  v_new jsonb;
  v_seeded jsonb;
BEGIN
  SELECT row_to_json(u) INTO v_new FROM auth.users u WHERE email = 'test_new_user@demo.com';
  SELECT row_to_json(u) INTO v_seeded FROM auth.users u WHERE email = 'admin@demo.com';
  
  INSERT INTO public.debug_log (msg) VALUES ('new user full row: ' || v_new::text);
  INSERT INTO public.debug_log (msg) VALUES ('seeded user full row: ' || v_seeded::text);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
