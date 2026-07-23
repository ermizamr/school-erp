DO $$
DECLARE
  v_hash text;
BEGIN
  v_hash := extensions.crypt('password123', extensions.gen_salt('bf'));
  INSERT INTO public.debug_log (msg) VALUES ('hash: ' || v_hash);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
