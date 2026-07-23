CREATE TABLE IF NOT EXISTS public.debug_log (
  id SERIAL PRIMARY KEY,
  msg TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Allow anon to read debug_log
ALTER TABLE public.debug_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read" ON public.debug_log FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.debug_log FOR INSERT WITH CHECK (true);

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT count(*) INTO v_count FROM auth.users;
  INSERT INTO public.debug_log (msg) VALUES ('auth.users count: ' || v_count);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error querying auth.users: ' || SQLERRM);
END;
$$;
