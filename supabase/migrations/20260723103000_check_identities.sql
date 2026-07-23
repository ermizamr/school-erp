DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT count(*) INTO v_count FROM auth.identities;
  INSERT INTO public.debug_log (msg) VALUES ('auth.identities count: ' || v_count);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error querying auth.identities: ' || SQLERRM);
END;
$$;
