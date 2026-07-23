DO $$
DECLARE
  v_schema text;
BEGIN
  SELECT string_agg(column_name || ' ' || data_type, ', ') INTO v_schema FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'identities';
  INSERT INTO public.debug_log (msg) VALUES ('auth.identities schema: ' || v_schema);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
