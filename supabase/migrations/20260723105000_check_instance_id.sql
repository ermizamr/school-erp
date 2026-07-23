DO $$
DECLARE
  v_instance_id uuid;
BEGIN
  SELECT instance_id INTO v_instance_id FROM auth.users WHERE email = 'test_new_user@demo.com';
  INSERT INTO public.debug_log (msg) VALUES ('instance_id for new user: ' || COALESCE(v_instance_id::text, 'NULL'));
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
